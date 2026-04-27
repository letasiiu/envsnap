import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { deleteSnapshot, snapshotExists } from "./delete";
import { saveTagMap } from "../tag/tag";
import { saveHistory } from "../history/history";
import { formatDeleteResult, formatDeleteError } from "./formatDelete";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-delete-test-"));
}

function makeSnapshot(dir: string, name: string): void {
  const snap = { name, createdAt: new Date().toISOString(), vars: { FOO: "bar" } };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snap));
}

describe("snapshotExists", () => {
  it("returns true when snapshot file exists", () => {
    const dir = makeTmpDir();
    makeSnapshot(dir, "snap1");
    expect(snapshotExists(dir, "snap1")).toBe(true);
  });

  it("returns false when snapshot does not exist", () => {
    const dir = makeTmpDir();
    expect(snapshotExists(dir, "ghost")).toBe(false);
  });
});

describe("deleteSnapshot", () => {
  it("deletes an existing snapshot file", () => {
    const dir = makeTmpDir();
    makeSnapshot(dir, "mysnap");
    const result = deleteSnapshot(dir, "mysnap");
    expect(result.success).toBe(true);
    expect(fs.existsSync(path.join(dir, "mysnap.json"))).toBe(false);
  });

  it("returns error for non-existent snapshot", () => {
    const dir = makeTmpDir();
    const result = deleteSnapshot(dir, "nope");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/does not exist/);
  });

  it("removes tags associated with the deleted snapshot", () => {
    const dir = makeTmpDir();
    makeSnapshot(dir, "tagged");
    saveTagMap(dir, { prod: "tagged", dev: "other" });
    const result = deleteSnapshot(dir, "tagged");
    expect(result.tagsRemoved).toEqual(["prod"]);
  });

  it("prunes history entries for the deleted snapshot", () => {
    const dir = makeTmpDir();
    makeSnapshot(dir, "histsnap");
    saveHistory(dir, [
      { snapshotName: "histsnap", action: "save", timestamp: "2024-01-01T00:00:00Z" },
      { snapshotName: "other", action: "save", timestamp: "2024-01-02T00:00:00Z" },
    ]);
    const result = deleteSnapshot(dir, "histsnap");
    expect(result.historyPruned).toBe(1);
  });
});

describe("formatDeleteResult", () => {
  it("formats a successful delete", () => {
    const out = formatDeleteResult({ success: true, name: "snap1", tagsRemoved: [], historyPruned: 0 });
    expect(out).toContain("Deleted snapshot");
  });

  it("formats an error result", () => {
    const out = formatDeleteResult({ success: false, name: "x", tagsRemoved: [], historyPruned: 0, error: "not found" });
    expect(out).toContain("Error");
  });

  it("formatDeleteError includes snapshot name", () => {
    expect(formatDeleteError("mysnap")).toContain("mysnap");
  });
});
