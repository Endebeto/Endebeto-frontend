// Runs Vitest with a normalised working directory.
//
// On Windows, Vitest 5 loads its runtime twice when the shell's cwd uses a
// lowercase drive letter (VS Code terminals often open as `c:\...`): Node
// loads it from `c:/...` while Vite resolves the test file's `import "vitest"`
// to `C:/...`. The two copies don't share state, so every suite fails with
// "Cannot read properties of undefined (reading 'config')" at `describe`.
// Upper-casing the drive letter avoids that. Elsewhere this is a pass-through.
import { spawnSync } from "node:child_process";
import path from "node:path";

const cwd =
  process.platform === "win32"
    ? process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase())
    : process.cwd();

const vitestBin = path.join(cwd, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(
  process.execPath,
  [vitestBin, ...process.argv.slice(2)],
  { cwd, stdio: "inherit" },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
