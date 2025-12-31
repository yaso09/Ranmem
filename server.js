const express = require("express");
const path = require("path");

const app = express();
app.use(express.static("public"));
app.use(express.json());

/* ================= REDDIT PROXY ================= */
app.get("/api/reddit", async (req, res) => {
  const { sub, sort = "hot", limit = 50 } = req.query;
  if (!sub) return res.status(400).json({ error: "sub gerekli" });

  try {
    const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/${sort}.json?limit=${limit}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Ranmem v0.2 by /u/yasirovic" }
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Reddit non-JSON response:", response.status, text.slice(0, 200));
      return res.status(502).json({ error: "reddit_json_alinamadi", status: response.status });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("Reddit fetch error:", e);
    res.status(500).json({ error: "reddit_fetch_exception" });
  }
});

/* ================= FRONTEND ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ranmem running on port ${PORT}`));
