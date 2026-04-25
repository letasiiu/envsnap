import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { copySnapshot, snapshotExists } from "./copy";
import { saveSnapshot } from "../snapshot";
import type { Snapshot } from "../snapshot";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-copy-test-"));
}

function makeSnapshot(name: string): Snapshot {
  return {
    name,
    createdAt: "2024-01-01T00:00:00.000Z",
    env: { FOO: "bar", BAZ: "qux" },
  };
}

describe("snapshotExists", () => {
  it("returns false when snapshot file does not exist", () => {
    const dir = makeTmpDir();
    expect(snapshotExists(dir, "missing")).toBe(false);
  });

  it("returns true when snapshot file exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(dir, makeSnapshot("present"));
    expect(snapshotExists(dir, "present")).toBe(true);
  });
});

describe("copySnapshot", () => {
  it("copies a snapshot to a new name", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(dir, makeSnapshot("original"));
    const result = await copySnapshot(dir, "original", "clone");
    expect(result.success).toBe(true);
    expect(result.sourceName).toBe("original");
    expect(result.destName).toBe("clone");
    expect(snapshotExists(dir, "clone")).toBe(true);
  });

  it("preserves env vars in the copy", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(dir, makeSnapshot("src"));
    await copySnapshot(dir, "src", "dst");
    const content = fs.readFileSync(path.join(dir, "dst.json"), "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed.env).toEqual({ FOO: "bar", BAZ: "qux" });
    expect(parsed.name).toBe("dst");
  });

  it("fails when source does not exist", async () => {
    const dir = makeTmpDir();
    const result = await copySnapshot(dir, "ghost", "copy");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/does not exist/);
  });

  it("fails when destination already exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(dir, makeSnapshot("a"));
    await saveSnapshot(dir, makeSnapshot("b"));
    const result = await copySnapshot(dir, "a", "b");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });
});
