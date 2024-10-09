const express = require("express");
const path = require("path");
const CobaltAPI = require("cobalt-api");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get("/api/dl", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const cookies = fs.readFileSync("cookies.txt", "utf8");
    const response = await axios.get(videoUrl, {
      headers: { Cookie: cookies },
    });

    const $ = cheerio.load(response.data);
    const title = $("title").text().replace(" - YouTube", "").trim();

    const cobalt = new CobaltAPI(videoUrl);
    cobalt.setAFormat("mp3");
    cobalt.enableAudioOnly();

    cobalt
      .sendRequest()
      .then((downloadResponse) => {
        if (downloadResponse.status) {
          res.json({
            success: true,
            title,
            data: {
              downloadLink: downloadResponse.data, // Assuming API gives a download link
            },
          });
        } else {
          res.status(500).json({ success: false, message: "Download failed" });
        }
      })
      .catch((error) => res.status(500).json({ error: error.message }));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video title" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
//Jonell Magallanes Hahhaa