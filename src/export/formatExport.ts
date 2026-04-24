import { ExportFormat } from './export';

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  dotenv: '.env',
  json: '.json',
  shell: '.sh',
};

export function suggestOutputFilename(
  snapshotName: string,
  format: ExportFormat
): string {
  const safe = snapshotName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safe}${FORMAT_EXTENSIONS[format]}`;
}

export function formatExportSummary(
  snapshotName: string,
  format: ExportFormat,
  outputPath: string,
  keyCount: number
): string {
  const lines = [
    `✔  Exported snapshot "${snapshotName}"`,
    `   Format  : ${format}`,
    `   Output  : ${outputPath}`,
    `   Keys    : ${keyCount}`,
  ];
  return lines.join('\n');
}

export function listSupportedFormats(): string {
  const formats: ExportFormat[] = ['dotenv', 'json', 'shell'];
  const rows = formats.map((f) => `  ${f.padEnd(10)} ${FORMAT_EXTENSIONS[f]}`);
  return ['Supported export formats:', ...rows].join('\n');
}
