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
      output: "$filename",
      writeAutoSub: true,
      subFormat: "json3",
      skipDownload: true,
    };

    const info = await youtubedl(url as string, options);
    res.json(info);
  } catch (error) {
    res.status(500).send("Error processing the request");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
