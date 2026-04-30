import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  createArchive,
  saveArchive,
  loadArchive,
  listArchives,
  archiveAllSnapshots,
  getArchiveFilePath,
} from "./archive";
import { saveSnapshot, createSnapshot } from "../snapshot";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-archive-test-"));
}

function seedSnapshot(dir: string, name: string, env: Record<string, string>) {
  const snap = createSnapshot(name, env);
  saveSnapshot(dir, snap);
  return snap;
}

describe("getArchiveFilePath", () => {
  it("returns correct path", () => {
    expect(getArchiveFilePath("/tmp/store", "my-archive")).toBe(
      "/tmp/store/my-archive.archive.json"
    );
  });
});

describe("createArchive", () => {
  it("creates manifest with entries for given snapshots", () => {
    const dir = makeTmpDir();
    seedSnapshot(dir, "snap-a", { FOO: "1" });
    seedSnapshot(dir, "snap-b", { BAR: "2", BAZ: "3" });
    const manifest = createArchive(dir, ["snap-a", "snap-b"]);
    expect(manifest.entries).toHaveLength(2);
    expect(manifest.entries[0].name).toBe("snap-a");
    expect(manifest.entries[1].name).toBe("snap-b");
    expect(manifest.version).toBe(1);
  });

  it("throws if a snapshot does not exist", () => {
    const dir = makeTmpDir();
    expect(() => createArchive(dir, ["missing"])).toThrow("Snapshot not found: missing");
  });
});

describe("saveArchive and loadArchive", () => {
  it("round-trips manifest to disk", () => {
    const dir = makeTmpDir();
    seedSnapshot(dir, "snap-x", { X: "42" });
    const manifest = createArchive(dir, ["snap-x"]);
    saveArchive(dir, "test-archive", manifest);
    const loaded = loadArchive(dir, "test-archive");
    expect(loaded).not.toBeNull();
    expect(loaded!.entries[0].name).toBe("snap-x");
  });

  it("returns null if archive does not exist", () => {
    const dir = makeTmpDir();
    expect(loadArchive(dir, "nonexistent")).toBeNull();
  });
});

describe("listArchives", () => {
  it("lists archive names in storage dir", () => {
    const dir = makeTmpDir();
    seedSnapshot(dir, "s1", { A: "1" });
    saveArchive(dir, "archive-one", createArchive(dir, ["s1"]));
    saveArchive(dir, "archive-two", createArchive(dir, ["s1"]));
    const list = listArchives(dir);
    expect(list).toContain("archive-one");
    expect(list).toContain("archive-two");
  });

  it("returns empty array when dir does not exist", () => {
    expect(listArchives("/nonexistent/path")).toEqual([]);
  });
});

describe("archiveAllSnapshots", () => {
  it("archives all snapshots in storage dir", () => {
    const dir = makeTmpDir();
    seedSnapshot(dir, "env-dev", { NODE_ENV: "development" });
    seedSnapshot(dir, "env-prod", { NODE_ENV: "production" });
    const manifest = archiveAllSnapshots(dir, "full-backup");
    expect(manifest.entries).toHaveLength(2);
    expect(fs.existsSync(path.join(dir, "full-backup.archive.json"))).toBe(true);
  });

  it("throws when no snapshots exist", () => {
    const dir = makeTmpDir();
    expect(() => archiveAllSnapshots(dir, "empty")).toThrow("No snapshots found");
  });
});
