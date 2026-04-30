import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { pruneSnapshots } from "./prune";
import { formatPruneResult } from "./formatPrune";
import { saveSnapshot } from "../snapshot";
import { pinSnapshot } from "../pin";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-prune-"));
}

function makeSnapshot(name: string, createdAt: number) {
  return { name, createdAt, vars: { KEY: "value" } };
}

describe("pruneSnapshots", () => {
  it("removes snapshots beyond keepLast", async () => {
    const dir = makeTmpDir();
    const now = Date.now();
    await saveSnapshot(dir, makeSnapshot("snap1", now - 3000));
    await saveSnapshot(dir, makeSnapshot("snap2", now - 2000));
    await saveSnapshot(dir, makeSnapshot("snap3", now - 1000));

    const result = await pruneSnapshots(dir, { keepLast: 2 });
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0]).toBe("snap1");
    expect(result.kept).toHaveLength(2);
    expect(fs.existsSync(path.join(dir, "snap1.json"))).toBe(false);
  });

  it("removes snapshots older than specified days", async () => {
    const dir = makeTmpDir();
    const now = Date.now();
    const old = now - 10 * 24 * 60 * 60 * 1000;
    await saveSnapshot(dir, makeSnapshot("old-snap", old));
    await saveSnapshot(dir, makeSnapshot("new-snap", now - 1000));

    const result = await pruneSnapshots(dir, { olderThanDays: 5 });
    expect(result.removed).toContain("old-snap");
    expect(result.kept).toContain("new-snap");
  });

  it("skips pinned snapshots", async () => {
    const dir = makeTmpDir();
    const now = Date.now();
    await saveSnapshot(dir, makeSnapshot("pinned-snap", now - 5000));
    await saveSnapshot(dir, makeSnapshot("other-snap", now - 4000));
    await pinSnapshot(dir, "pinned-snap");

    const result = await pruneSnapshots(dir, { keepLast: 1 });
    expect(result.pinned).toContain("pinned-snap");
    expect(result.removed).not.toContain("pinned-snap");
  });

  it("dry run does not delete files", async () => {
    const dir = makeTmpDir();
    const now = Date.now();
    await saveSnapshot(dir, makeSnapshot("snap-a", now - 3000));
    await saveSnapshot(dir, makeSnapshot("snap-b", now - 2000));
    await saveSnapshot(dir, makeSnapshot("snap-c", now - 1000));

    const result = await pruneSnapshots(dir, { keepLast: 1, dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(result.removed).toHaveLength(2);
    expect(fs.existsSync(path.join(dir, "snap-a.json"))).toBe(true);
  });
});

describe("formatPruneResult", () => {
  it("shows dry-run label when dryRun is true", () => {
    const result = { removed: ["old"], kept: ["new"], pinned: [], dryRun: true };
    const out = formatPruneResult(result);
    expect(out).toContain("[dry-run]");
    expect(out).toContain("old");
  });

  it("shows no-prune message when nothing removed", () => {
    const result = { removed: [], kept: ["snap1"], pinned: [], dryRun: false };
    const out = formatPruneResult(result);
    expect(out).toContain("No snapshots to prune");
  });

  it("lists pinned snapshots", () => {
    const result = { removed: [], kept: [], pinned: ["locked"], dryRun: false };
    const out = formatPruneResult(result);
    expect(out).toContain("locked");
    expect(out).toContain("pinned");
  });
});
