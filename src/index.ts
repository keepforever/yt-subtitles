// Import required packages
import express from "express";
import youtubedl from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import { JsonData, extractUtf8 } from "./utils/extractUtf8";

// Create an Express app and set the port to listen on
const app = express();
const port = process.env.PORT || 3000;

// Route for the root path
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Route to download a video from YouTube
app.get("/download", async (req, res) => {
  const url = req.query.url;

  // Check if the 'url' parameter is present in the request
  if (!url) {
    res.status(400).send("No URL provided");
    return;
  }

  // Generate a filename for the downloaded video info
  const dateString = new Date().getTime().toString();
  const outputFilename = `${__dirname}/json/${dateString}`;

  try {
    // Download the video using 'youtubedl' with specified options
    const options = {
      format: "best",
      output: outputFilename,
      writeAutoSub: true,
      subFormat: "json3",
      skipDownload: true,
    };
    const info = await youtubedl(url as string, options);

    // Log the downloaded video info to the console
    const infoJson = JSON.stringify(info);
    console.log("Video info:", infoJson);

    // Ensure the /text directory exists
    const textDir = path.join(__dirname, "text");
    if (!fs.existsSync(textDir)) {
      fs.mkdirSync(textDir);
    }

    // Read the downloaded subtitle data as JSON
    fs.readFile(`${outputFilename}.en.json3`, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${outputFilename}:`, err);
        process.exit(1);
      }

      try {
        // Extract the subtitle text as a string and write to a text file
        const jsonData = JSON.parse(data) as JsonData;
        let combinedUtf8 = extractUtf8(jsonData);
        /* Remove new lines and replace with period and space */
        // combinedUtf8 = combinedUtf8.replace(/\n/g, ". ");

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

    // Return the downloaded video info as a JSON response
    res.json(info);
  } catch (error) {
    console.log("\n", `error = `, error, "\n");
    // Return a 500 error response if there was an error downloading the video
    res.status(500).send("Error downloading video");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
