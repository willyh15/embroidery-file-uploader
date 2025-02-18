const { visibility = "private" } = req.body;
await kv.hset(`file:${url}`, { visibility });