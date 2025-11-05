import { readFileSync } from "fs";
import { join } from "path";

let htmlTemplate: string;

try {
  htmlTemplate = require("./index.html") as string;
} catch {
  htmlTemplate = readFileSync(join(process.cwd(), "index.html"), "utf-8");
}

export default htmlTemplate;
