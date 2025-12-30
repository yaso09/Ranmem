const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).end();

  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  res.setHeader("Content-Type", r.headers.get("content-type") || "application/octet-stream");
  r.body.pipe(res);
});

app.post("/api/meme", async (req, res) => {
  const { sub } = req.body;

  const r = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=50`);
  const j = await r.json();

  const p = j.data.children
    .map(c => c.data)
    .find(p => p.is_video && p.media?.reddit_video);

  if (!p) return res.json({ ok:false });

  const base = p.media.reddit_video.fallback_url.split("DASH_")[0];

  res.json({
    ok: true,
    title: p.title,
    video: base + "DASH_720.mp4",
    audio: base + "DASH_audio.mp4"
  });
});

module.exports = app;

/* ======================
   START
====================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Ranmem running on", PORT));
