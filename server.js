const WebSocket = require("ws");
const express = require("express");
const fs = require("fs");
const { kv } = require("@vercel/kv");

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

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "update", fileUrl: data.fileUrl, edits: data.edits }));
          }
        });

        await kv.set(`live-edit:${data.fileUrl}`, JSON.stringify(data.edits));
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