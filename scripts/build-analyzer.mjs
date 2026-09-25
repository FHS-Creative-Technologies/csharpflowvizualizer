import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, "..");
const analyzerProject = path.join(
  workspaceRoot,
  "roslynAnalyzer",
  "roslynAnalyzer.csproj",
);
const outputDirectory = path.join(workspaceRoot, "analyzer-dist");

// Remove stale files from previous builds so they are not packaged.
fs.rmSync(outputDirectory, { recursive: true, force: true });

const result = spawnSync(
  "dotnet",
  [
    "publish",
    analyzerProject,
    "--configuration",
    "Release",
    "--output",
    outputDirectory,
    "/nologo",
  ],
  {
    cwd: workspaceRoot,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`Failed to publish Roslyn analyzer: ${result.error.message}`);
  process.exit(1);
}

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}
