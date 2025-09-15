import fetch from "node-fetch";
import fs from "fs/promises";
import { BadException, NotFoundError } from "../../error/ErrorTypes";
import { parse } from "csv-parse/sync";
import cron from "node-cron";

export async function parseTop50Global(): Promise<
  BadException | any | NotFoundError
> {
  try {
    const data = await fs.readFile("uploads/top200.csv", "utf8");

    if (!data) return new NotFoundError("No file found");

    const records = parse(data, {
      columns: true,          // use the first row as headers
      skip_empty_lines: true,
    });

    return records;
  } catch (err) {
    return new BadException("Error fetching csv");
  }
}

// Run job every Monday at 00:00 (midnight)
cron.schedule("0 0 * * 1", () => {
  console.log("Running weekly fetch...");
  parseTop50Global();
});

parseTop50Global();
