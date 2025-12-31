import fetch from "node-fetch";

export default async function handler(req, res) {
  const { sub, sort = "hot", limit = 50 } = req.query;
  if (!sub) {
    res.status(400).json({ error: "sub gerekli" });
    return;
  }

  try {
    const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/${sort}.json?limit=${limit}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Ranmem v0.1 by /u/yasirovic" }
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Reddit non-JSON response:", response.status, text.slice(0, 200));
      res.status(502).json({ error: "reddit_json_alinamadi", status: response.status });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error("Reddit fetch error:", e);
    res.status(500).json({ error: "reddit_fetch_exception" });
  }
}
