import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MODULES_DIR = resolve("src/modules");

// Folders a module may not reach into.
const FORBIDDEN_PATHS = ["/infrastructure/", "/generated/"];

// Libraries that belong behind an interface, in src/infrastructure.
const FORBIDDEN_PACKAGES = [
  "@prisma/",
  "@opensearch-project/",
  "pg",
  "bcrypt",
  "jsonwebtoken",
];

const IMPORT_PATTERN = /(?:from|import|require\()\s*["']([^"']+)["']/g;

const isForbidden = (specifier: string): boolean =>
  FORBIDDEN_PATHS.some((path) => specifier.includes(path)) ||
  FORBIDDEN_PACKAGES.some(
    (name) =>
      specifier === name ||
      specifier.startsWith(name.endsWith("/") ? name : `${name}/`),
  );

describe("module boundaries", () => {
  it("keeps infrastructure and vendor libraries out of src/modules", () => {
    const files = readdirSync(MODULES_DIR, { recursive: true })
      .map(String)
      .filter((file) => file.endsWith(".ts"));

    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const file of files) {
      const source = readFileSync(join(MODULES_DIR, file), "utf8");

      for (const [, specifier] of source.matchAll(IMPORT_PATTERN)) {
        if (isForbidden(specifier)) {
          violations.push(`${file} imports ${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
