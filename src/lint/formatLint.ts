import { LintResult, LintIssue, LintSeverity, getBuiltinLintRules } from './lint';

const SEVERITY_ICON: Record<LintSeverity, string> = {
  error: '✖',
  warn: '⚠',
  info: 'ℹ',
};

export function formatIssue(issue: LintIssue): string {
  const icon = SEVERITY_ICON[issue.severity];
  return `  ${icon} [${issue.ruleId}] ${issue.message}`;
}

export function formatLintResult(result: LintResult): string {
  const lines: string[] = [];
  lines.push(`Lint results for snapshot: ${result.snapshotId}`);
  lines.push('');

  if (result.issues.length === 0) {
    lines.push('  ✔ No issues found.');
  } else {
    const errors = result.issues.filter((i) => i.severity === 'error');
    const warns = result.issues.filter((i) => i.severity === 'warn');
    const infos = result.issues.filter((i) => i.severity === 'info');

    if (errors.length > 0) {
      lines.push('Errors:');
      errors.forEach((i) => lines.push(formatIssue(i)));
      lines.push('');
    }
    if (warns.length > 0) {
      lines.push('Warnings:');
      warns.forEach((i) => lines.push(formatIssue(i)));
      lines.push('');
    }
    if (infos.length > 0) {
      lines.push('Info:');
      infos.forEach((i) => lines.push(formatIssue(i)));
      lines.push('');
    }
  }

  lines.push(
    `Summary: ${result.passed} check(s) passed, ${result.failed} issue(s) found.`
  );

  return lines.join('\n');
}

export function formatLintSummary(result: LintResult): string {
  const status = result.failed === 0 ? '✔ passed' : `✖ ${result.failed} issue(s)`;
  return `Snapshot ${result.snapshotId}: ${status}`;
}

export function listLintRuleDescriptions(): string {
  const rules = getBuiltinLintRules();
  return rules
    .map((r) => `  [${r.severity.toUpperCase()}] ${r.id}: ${r.description}`)
    .join('\n');
}
