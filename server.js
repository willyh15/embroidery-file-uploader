const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  fs.appendFileSync("server.log", `${new Date()} - ${req.method} ${req.url}\n`);
  next();
});

app.listen(3000, () => console.log("Server running on port 3000"));