// scripts/generate-article-index.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 👇 解决 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, "../../public/articles");
const output = path.join(baseDir, "index.json");

const entries = fs
    .readdirSync(baseDir)
    .filter((name) =>
        fs.existsSync(path.join(baseDir, name, "meta.json"))
    );

const index = entries.map((slug) => {
    const metaPath = path.join(baseDir, slug, "meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    return { slug, ...meta };
});

fs.writeFileSync(output, JSON.stringify(index, null, 2));
console.log("✅ Built /articles/index.json");
