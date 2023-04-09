import express from "express";
import youtubedl from "youtube-dl-exec";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    res.status(400).send("No URL provided");
    return;
  }

  try {
    const options = {
      format: "best",
      output: `${__dirname}/videos/%(id)s.%(ext)s`,
      writeAutoSub: true,
      subFormat: "json3",
      skipDownload: true,
    };

    const info = await youtubedl(url as string, options);

    const infoJson = JSON.stringify(info); // Convert `info` object to JSON string
    console.log("Video info:", infoJson); // Log the JSON string

    res.json(info); // Send the original `info` object as a JSON response
  } catch (error) {
    console.log("\n", `error = `, error, "\n");
    res.status(500).send("Error downloading video");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
