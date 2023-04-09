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

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide a JSON file as an argument.");
    process.exit(1);
  }

  const fileName = args[0];
  const outputFileName =
    path.basename(fileName, path.extname(fileName)) + ".txt";
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${fileName}:`, err);
      process.exit(1);
    }

    try {
      const jsonData = JSON.parse(data) as JsonData;
      let combinedUtf8 = extractUtf8(jsonData);

      // Replace new lines with a period
      combinedUtf8 = combinedUtf8.replace(/\n/g, ".");

      fs.writeFile(outputFileName, combinedUtf8, (err) => {
        if (err) {
          console.error(`Error writing to file ${outputFileName}:`, err);
          process.exit(1);
        }
        console.log(`Output has been saved to ${outputFileName}`);
      });
    } catch (err) {
      console.error("Error parsing JSON data:", err);
      process.exit(1);
    }
  });
}

main();
