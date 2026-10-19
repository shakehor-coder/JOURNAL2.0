import git from "isomorphic-git";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function initRepo() {
  console.log("1. Initializing Git repository in:", rootDir);
  await git.init({ fs, dir: rootDir, defaultBranch: "main" });

  console.log("2. Scanning files to add...");
  function getFiles(dir, base = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(base, entry.name).replace(/\\/g, "/");

      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(rootDir);
  console.log(`Found ${filesToAdd.length} files to stage.`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir: rootDir, filepath });
  }

  console.log("3. Creating initial commit...");
  const sha = await git.commit({
    fs,
    dir: rootDir,
    message: "Initial commit: Journal 2.0 with deployment configs and fixes",
    author: {
      name: "Top Student",
      email: "student@top-academy.ru"
    }
  });

  console.log("Commit successful! SHA:", sha);
  const log = await git.log({ fs, dir: rootDir, depth: 1 });
  console.log("Latest commit:", log[0].commit.message, "by", log[0].commit.author.name);
}

initRepo().catch(console.error);
