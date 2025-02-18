import { rateLimit } from "../../utils/rate-limit";

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (!(await rateLimit(ip, 5, 60))) {
    return res.status(429).json({ error: "Too many requests, try again later." });
  }

  // Proceed with existing comment logic...
}