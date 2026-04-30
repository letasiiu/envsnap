import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { cloneSnapshot, snapshotExists } from "./clone";
import { saveSnapshot } from "../snapshot";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-clone-"));
}

function makeSnapshot(name: string, env: Record<string, string>) {
  return {
    name,
    env,
    createdAt: new Date().toISOString(),
  };
}

describe("snapshotExists", () => {
  it("returns false when snapshot file is missing", () => {
    const dir = makeTmpDir();
    expect(snapshotExists("ghost", dir)).toBe(false);
  });

  it("returns true when snapshot file exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("present", { A: "1" }), dir);
    expect(snapshotExists("present", dir)).toBe(true);
  });
});

describe("cloneSnapshot", () => {
  it("clones a snapshot to a new name", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("original", { FOO: "bar", BAZ: "qux" }), dir);

    const result = await cloneSnapshot("original", "copy", dir);

    expect(result.success).toBe(true);
    expect(result.sourceName).toBe("original");
    expect(result.targetName).toBe("copy");
    expect(result.keyCount).toBe(2);
    expect(snapshotExists("copy", dir)).toBe(true);
  });

  it("returns error when source does not exist", async () => {
    const dir = makeTmpDir();
    const result = await cloneSnapshot("nonexistent", "copy", dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/nonexistent/);
  });

  it("returns error when target already exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("src", { X: "1" }), dir);
    await saveSnapshot(makeSnapshot("dst", { Y: "2" }), dir);

    const result = await cloneSnapshot("src", "dst", dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it("cloned snapshot has updated createdAt and correct name", async () => {
    const dir = makeTmpDir();
    const original = makeSnapshot("alpha", { KEY: "val" });
    await saveSnapshot(original, dir);

    await cloneSnapshot("alpha", "beta", dir);

    const clonedFile = path.join(dir, "beta.json");
    const cloned = JSON.parse(fs.readFileSync(clonedFile, "utf-8"));
    expect(cloned.name).toBe("beta");
    expect(cloned.env).toEqual({ KEY: "val" });
    expect(cloned.createdAt).not.toBe(original.createdAt);
  });
});
