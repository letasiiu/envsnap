import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  loadHistory,
  saveHistory,
  recordAction,
  getHistoryForSnapshot,
  clearHistory,
  getHistoryFilePath,
  HistoryEntry,
} from "./history";
import { formatHistoryTable, formatHistorySummary } from "./formatHistory";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-history-"));
}

describe("history", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty array when no history file exists", () => {
    expect(loadHistory(tmpDir)).toEqual([]);
  });

  it("saves and loads history entries", () => {
    const entry: HistoryEntry = {
      snapshotId: "abc123",
      name: "my-snap",
      action: "created",
      timestamp: new Date().toISOString(),
    };
    saveHistory([entry], tmpDir);
    const loaded = loadHistory(tmpDir);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].snapshotId).toBe("abc123");
  });

  it("recordAction appends an entry and returns it", () => {
    const entry = recordAction("id1", "snap1", "created", undefined, tmpDir);
    expect(entry.action).toBe("created");
    expect(entry.snapshotId).toBe("id1");
    const all = loadHistory(tmpDir);
    expect(all).toHaveLength(1);
  });

  it("recordAction stores meta when provided", () => {
    recordAction("id2", "snap2", "tagged", { tag: "v1.0" }, tmpDir);
    const all = loadHistory(tmpDir);
    expect(all[0].meta).toEqual({ tag: "v1.0" });
  });

  it("getHistoryForSnapshot filters by snapshotId", () => {
    recordAction("idA", "snapA", "created", undefined, tmpDir);
    recordAction("idB", "snapB", "restored", undefined, tmpDir);
    recordAction("idA", "snapA", "tagged", undefined, tmpDir);
    const result = getHistoryForSnapshot("idA", tmpDir);
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.snapshotId === "idA")).toBe(true);
  });

  it("clearHistory removes all entries", () => {
    recordAction("id1", "snap1", "created", undefined, tmpDir);
    clearHistory(tmpDir);
    expect(loadHistory(tmpDir)).toEqual([]);
  });

  it("getHistoryFilePath returns a path ending in history.json", () => {
    expect(getHistoryFilePath(tmpDir)).toMatch(/history\.json$/);
  });
});

describe("formatHistory", () => {
  const entries: HistoryEntry[] = [
    { snapshotId: "abc123def", name: "prod", action: "created", timestamp: "2024-01-01T00:00:00.000Z" },
    { snapshotId: "xyz789uvw", name: "dev", action: "restored", timestamp: "2024-01-02T00:00:00.000Z", meta: { file: ".env" } },
  ];

  it("formatHistoryTable renders a table with headers", () => {
    const output = formatHistoryTable(entries);
    expect(output).toContain("Timestamp");
    expect(output).toContain("created");
    expect(output).toContain("prod");
    expect(output).toContain("file=.env");
  });

  it("formatHistoryTable returns message for empty entries", () => {
    expect(formatHistoryTable([])).toBe("No history entries found.");
  });

  it("formatHistorySummary counts actions correctly", () => {
    const summary = formatHistorySummary(entries);
    expect(summary).toContain("2 total");
    expect(summary).toContain("created: 1");
    expect(summary).toContain("restored: 1");
  });
});
