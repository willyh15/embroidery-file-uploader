const WebSocket = require("ws");
const { kv } = require("@vercel/kv");

const wss = new WebSocket.Server({ port: 8080 });

let activeEdits = {};

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
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
  });

  ws.on("close", () => {
    console.log("User disconnected from stitch editing.");
  });
});

console.log("WebSocket server running on ws://localhost:8080");

const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  fs.appendFileSync("server.log", `${new Date()} - ${req.method} ${req.url}\n`);
  next();
});

app.listen(3000, () => console.log("Server running on port 3000"));