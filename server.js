const WebSocket = require("ws");
const express = require("express");
const fs = require("fs");
// ❌ Remove: const { kv } = require("@vercel/kv");

// ✅ Import Upstash Redis
const { Redis } = require("@upstash/redis");

// ✅ Create a Redis client (using environment variables)
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const app = express();
app.use(express.json());

// Log every request to "server.log"
app.use((req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  fs.appendFileSync("server.log", logEntry);
  next();
});

const server = app.listen(3000, () => console.log("HTTP server running on port 3000"));

const wss = new WebSocket.Server({ server });

let activeEdits = {};

wss.on("connection", (ws) => {
  console.log("New client connected for live stitch editing.");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "edit") {
        activeEdits[data.fileUrl] = data.edits;

        // Broadcast updated edits to all other connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "update",
              fileUrl: data.fileUrl,
              edits: data.edits,
            }));
          }
        });

        // ✅ Upstash Redis: store the edits by file URL
        await redis.set(`live-edit:${data.fileUrl}`, JSON.stringify(data.edits));
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from stitch editing.");
  });
});

console.log("WebSocket server integrated with HTTP server and running.");