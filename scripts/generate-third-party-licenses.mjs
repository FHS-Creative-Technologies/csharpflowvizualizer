import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, "..");
const webRoot = path.join(workspaceRoot, "web");
const outputPath = path.join(workspaceRoot, "THIRD_PARTY_LICENSES.md");

// Packages that only provide type declarations and are not part of the bundle.
const typeOnlyPackages = new Set(["csstype"]);

// Build-time packages whose code ends up in the bundled CSS.
const bundledDevPackages = ["tailwindcss"];

// NuGet packages shipped in analyzer-dist. The packages do not contain a
// license file, so the license text from their ThirdPartyNotices.rtf is used.
const nugetPackages = [
  { name: "Microsoft.CodeAnalysis.Common", version: "5.0.0" },
  { name: "Microsoft.CodeAnalysis.CSharp", version: "5.0.0" },
];

const roslynLicense = `The MIT License (MIT)

Copyright (c) .NET Foundation and Contributors

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

function collectProductionPackages() {
  const output = execFileSync(
    "npm",
    ["ls", "--omit=dev", "--all", "--parseable"],
    { cwd: webRoot, encoding: "utf8" },
  );

  const directories = output
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((directory) => path.resolve(directory) !== webRoot);

  for (const name of bundledDevPackages) {
    directories.push(path.join(webRoot, "node_modules", name));
  }

  return [...new Set(directories)];
}

function readLicenseText(directory) {
  const licenseFile = fs
    .readdirSync(directory)
    .find((file) => /^(licen[cs]e|copying)(\.|$)/i.test(file));

  return licenseFile
    ? fs.readFileSync(path.join(directory, licenseFile), "utf8").trim()
    : undefined;
}

function describeNpmPackage(directory) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json"), "utf8"),
  );

  if (manifest.name.startsWith("@types/") || typeOnlyPackages.has(manifest.name)) {
    return undefined;
  }

  const repository =
    typeof manifest.repository === "string"
      ? manifest.repository
      : manifest.repository?.url;

  return {
    name: manifest.name,
    version: manifest.version,
    license: manifest.license ?? "UNKNOWN",
    url: manifest.homepage ?? repository,
    text: readLicenseText(directory),
  };
}

const npmPackages = collectProductionPackages()
  .map(describeNpmPackage)
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

const entries = [
  ...nugetPackages.map((pkg) => ({
    ...pkg,
    license: "MIT",
    url: "https://github.com/dotnet/roslyn",
    text: roslynLicense,
  })),
  ...npmPackages,
];

const missingLicenses = entries.filter((entry) => !entry.text);
if (missingLicenses.length > 0) {
  console.warn(
    `No license file found for: ${missingLicenses.map((entry) => entry.name).join(", ")}`,
  );
}

const sections = entries.map((entry) => {
  const lines = [`## ${entry.name}@${entry.version}`, "", `License: ${entry.license}`];
  if (entry.url) {
    lines.push(`Source: ${entry.url.replace(/^git\+/, "")}`);
  }
  if (entry.text) {
    lines.push("", "```text", entry.text, "```");
  }
  return lines.join("\n");
});

const content = [
  "# Third-Party Licenses",
  "",
  "C# Visualizer bundles the following third-party software.",
  "",
  sections.join("\n\n"),
  "",
].join("\n");

fs.writeFileSync(outputPath, content, "utf8");
console.log(`Wrote ${entries.length} entries to ${path.relative(workspaceRoot, outputPath)}`);
