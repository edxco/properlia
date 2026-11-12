// Checks that each package version matches its latest CHANGELOG release and the root lockfile.
// Usage: npm run check:versions  (exits 1 on any mismatch)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["frontend", "dashboard", "links", "shared"];
const read = (path) => readFileSync(join(root, path), "utf8");

const lock = JSON.parse(read("package-lock.json"));
const errors = [];

for (const name of PACKAGES) {
  const { version } = JSON.parse(read(`packages/${name}/package.json`));
  const changelog = read(`packages/${name}/CHANGELOG.md`);
  const released = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
  const locked = lock.packages?.[`packages/${name}`]?.version;

  if (!/^## \[Unreleased\]/m.test(changelog)) errors.push(`${name}: CHANGELOG.md has no "## [Unreleased]" section`);
  if (!released) errors.push(`${name}: CHANGELOG.md has no "## [x.y.z]" release heading`);
  else if (released !== version) errors.push(`${name}: package.json is ${version} but the latest CHANGELOG release is ${released}`);
  if (locked !== version) errors.push(`${name}: package-lock.json has ${locked ?? "no entry"} but package.json is ${version}`);

  if (!errors.some((error) => error.startsWith(`${name}:`))) console.log(`ok  ${name} ${version}`);
}

if (errors.length) {
  console.error(`\n${errors.map((error) => `x   ${error}`).join("\n")}`);
  console.error("\nFix with: npm version <x.y.z> --workspace=<name> --no-git-tag-version, and update the CHANGELOG heading (see CLAUDE.md).");
  process.exit(1);
}
