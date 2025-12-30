const express = require("express");
const fetch = require("node-fetch");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

app.use(express.static("."));

app.get("/video", async (req, res) => {
    const dashUrl = req.query.url;
    if (!dashUrl) return res.sendStatus(400);

    try {
        // DASH manifest indir
        const dashRes = await fetch(dashUrl);
        const dashText = await dashRes.text();

        // audio + video URL’lerini çek
        const base = dashUrl.replace(/\/DASHPlaylist\.mpd.*/, "");
        const videoMatch = dashText.match(/DASH_[0-9]+\.mp4/);
        const audioMatch = dashText.match(/DASH_audio\.mp4/);

        if (!videoMatch || !audioMatch) {
            return res.sendStatus(404);
        }

        const videoUrl = `${base}/${videoMatch[0]}`;
        const audioUrl = `${base}/${audioMatch[0]}`;

        res.setHeader("Content-Type", "video/mp4");

        // ffmpeg ile stream birleşimi
        const ffmpeg = spawn("ffmpeg", [
            "-loglevel", "quiet",
            "-i", videoUrl,
            "-i", audioUrl,
            "-c:v", "copy",
            "-c:a", "aac",
            "-f", "mp4",
            "pipe:1"
        ]);

        ffmpeg.stdout.pipe(res);
        ffmpeg.stderr.on("data", () => {});
    } catch (e) {
        res.sendStatus(500);
    }
});

app.listen(PORT, () =>
    console.log(`✅ Server running → http://localhost:${PORT}`)
);
