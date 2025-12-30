const express = require("express");

const app = express();
app.use(express.static("public"));

/* ================= REDDIT JSON PROXY ================= */
app.get("/api/reddit", async (req, res) => {
  const { sub, sort = "hot", limit = 50 } = req.query;
  if (!sub) return res.status(400).json({ error: "sub gerekli" });

  try {
    const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/${sort}.json?limit=${limit}`;
    const r = await fetch(url, { headers: { "User-Agent": "Ranmem v0.1 by /u/yasirovic" } });

    const contentType = r.headers.get("content-type") || "";
    if (!r.ok || !contentType.includes("application/json")) {
      const text = await r.text();
      console.error("Reddit non-JSON response:", r.status, text.slice(0, 200));
      return res.status(502).json({ error: "reddit_json_alinamadi", status: r.status });
    }

    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("Reddit fetch error:", e);
    res.status(500).json({ error: "reddit_fetch_exception" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Ranmem running on", PORT));
