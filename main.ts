import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The whole entry for this competition is a single word:
// the entrant's own make.fun username, exactly as registered.
const USERNAME = "steady-lynx-69";

// Self-check: the entry has to be the username character for character,
// and the competition caps a username at 30 characters.
function checkEntry(value: string): void {
  if (value !== USERNAME) {
    throw new Error(`entry mismatch: expected "${USERNAME}", got "${value}"`);
  }
  if (value.length > 30) {
    throw new Error(`entry is ${value.length} characters, over the 30 character limit`);
  }
  if (value.length === 0) {
    throw new Error("entry must not be empty");
  }
}

function main(): void {
  checkEntry(USERNAME);

  const outDir = process.env.OUTPUT_DIR ?? "/output";

  // Create the output directory if needed. The directory itself is
  // never removed: on the grading runner it may be a mounted volume,
  // so only the entry file inside it is (re)written.
  mkdirSync(outDir, { recursive: true });

  const entryPath = join(outDir, "entry.txt");

  // Write exactly the username as UTF-8 text: no trailing newline,
  // no extra words, no links, nothing else.
  writeFileSync(entryPath, USERNAME, { encoding: "utf8" });

  // Read-back verification: re-read the file from disk and assert it
  // matches the constant exactly. Comparing the raw bytes (not just a
  // decoded string) catches anything the in-memory check cannot see —
  // a trailing newline, stray whitespace, a BOM, or a partial write —
  // so a malformed entry fails loudly here instead of at judging time.
  const written = readFileSync(entryPath);
  const expected = Buffer.from(USERNAME, "utf8");
  if (!written.equals(expected)) {
    throw new Error(
      `read-back mismatch: expected ${expected.length} bytes "${USERNAME}", ` +
        `got ${written.length} bytes ${JSON.stringify(written.toString("utf8"))}`,
    );
  }

  console.log(`wrote ${entryPath}: ${USERNAME} (verified ${written.length} bytes)`);
}

main();
