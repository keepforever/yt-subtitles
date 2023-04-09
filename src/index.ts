import express from "express";
import youtubedl from "youtube-dl-exec";
import fs from "fs";
import path from "path";

interface Event {
  segs?: Array<{ utf8?: string }>;
}

interface JsonData {
  events: Event[];
}

function extractUtf8(jsonData: JsonData): string {
  let result = "";

  jsonData.events.forEach((event) => {
    if (event.segs) {
      event.segs.forEach((segment) => {
        if (segment.utf8) {
          result += segment.utf8;
        }
      });
    }
  });

  return result;
}

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

  const dateString = new Date().getTime().toString();
  const outputFilename = `${__dirname}/json/${dateString}`;
  const writeFilename = `${__dirname}/text/${dateString}`;

  try {
    const options = {
      format: "best",
      output: outputFilename,
      writeAutoSub: true,
      subFormat: "json3",
      skipDownload: true,
    };

    const info = await youtubedl(url as string, options);

    const infoJson = JSON.stringify(info);
    console.log("Video info:", infoJson);

    // Ensure the /text directory exists
    const textDir = path.join(__dirname, "text");
    if (!fs.existsSync(textDir)) {
      fs.mkdirSync(textDir);
    }

    fs.readFile(`${outputFilename}.en.json3`, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${outputFilename}:`, err);
        process.exit(1);
      }

      try {
        const jsonData = JSON.parse(data) as JsonData;
        let combinedUtf8 = extractUtf8(jsonData);

        // Replace new lines with a period
        combinedUtf8 = combinedUtf8.replace(/\n/g, ". ");

        const writeFileDestination = path.join(textDir, `${dateString}.txt`);

        fs.writeFile(writeFileDestination, combinedUtf8, (err) => {
          if (err) {
            console.error(
              `Error writing to file ${writeFileDestination}:`,
              err
            );
            process.exit(1);
          }
          console.log(`Output has been saved to ${writeFileDestination}`);
        });
      } catch (err) {
        console.error("Error parsing JSON data:", err);
        process.exit(1);
      }
    });

    res.json(info); // Send the original `info` object as a JSON response
  } catch (error) {
    console.log("\n", `error = `, error, "\n");
    res.status(500).send("Error downloading video");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
