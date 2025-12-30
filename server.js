const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.static("public"));

/**
 * Reddit JSON proxy
 */
app.get("/api/reddit", async (req, res) => {
  const { sub, sort = "hot", limit = 50 } = req.query;
  if (!sub) return res.status(400).json({ error: "sub gerekli" });

  try {
    const r = await fetch(
      `https://www.reddit.com/r/${sub}/${sort}.json?limit=${limit}`,
      { headers: { "User-Agent": "Ranmem/1.0" } }
    );
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "reddit error" });
  }
});

/**
 * DASH proxy (SES BURADA)
 */
app.get("/api/dash", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.sendStatus(400);

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Ranmem/1.0" }
    });

    res.set("Content-Type", r.headers.get("content-type"));
    res.set("Access-Control-Allow-Origin", "*");
    r.body.pipe(res);
  } catch {
    res.sendStatus(500);
  }
});

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Ranmem running on", PORT));
