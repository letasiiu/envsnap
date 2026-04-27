import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { copySnapshot, snapshotExists } from "./copy";
import { saveSnapshot } from "../snapshot";
import { Snapshot } from "../snapshot";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-copy-test-"));
}

function makeSnapshot(name: string): Snapshot {
  return {
    name,
    createdAt: new Date().toISOString(),
    env: { NODE_ENV: "test", PORT: "3000" },
  };
}

describe("snapshotExists", () => {
  it("returns false when snapshot file is missing", () => {
    const dir = makeTmpDir();
    expect(snapshotExists(dir, "ghost")).toBe(false);
  });

  it("returns true when snapshot file exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("present"), dir);
    expect(snapshotExists(dir, "present")).toBe(true);
  });
});

describe("copySnapshot", () => {
  it("copies a snapshot to a new name", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("original"), dir);

    const result = await copySnapshot("original", "clone", dir);

    expect(result.success).toBe(true);
    expect(result.source).toBe("original");
    expect(result.destination).toBe("clone");
    expect(snapshotExists(dir, "clone")).toBe(true);
    expect(snapshotExists(dir, "original")).toBe(true);
  });

  it("returns error when source does not exist", async () => {
    const dir = makeTmpDir();
    const result = await copySnapshot("missing", "clone", dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/does not exist/);
  });

  it("returns error when destination already exists", async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot("src"), dir);
    await saveSnapshot(makeSnapshot("dest"), dir);

    const result = await copySnapshot("src", "dest", dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it("copied snapshot has updated name and createdAt", async () => {
    const dir = makeTmpDir();
    const original = makeSnapshot("alpha");
    await saveSnapshot(original, dir);

    await copySnapshot("alpha", "beta", dir);

    const betaFile = path.join(dir, "beta.json");
    const beta = JSON.parse(fs.readFileSync(betaFile, "utf-8"));
    expect(beta.name).toBe("beta");
    expect(beta.env).toEqual(original.env);
  });
});
