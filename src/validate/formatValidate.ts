import { ValidationResult, ValidationViolation } from './validate';

const PASS = '\u2713';
const FAIL = '\u2717';

function formatViolation(v: ValidationViolation): string {
  return `  ${FAIL}  [${v.rule}] ${v.key}=${JSON.stringify(v.value)}\n     ${v.description}`;
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  const status = result.passed ? `${PASS} PASSED` : `${FAIL} FAILED`;

  lines.push(`Validation for snapshot: ${result.snapshotName} (${result.snapshotId})`);
  lines.push(`Status: ${status}`);

  if (result.violations.length > 0) {
    lines.push(`\nViolations (${result.violations.length}):`);
    for (const v of result.violations) {
      lines.push(formatViolation(v));
    }
  } else {
    lines.push('\nAll checks passed.');
  }

  return lines.join('\n');
}

export function formatValidationSummary(results: ValidationResult[]): string {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const lines: string[] = [];

  lines.push(`Validation Summary: ${results.length} snapshot(s) checked`);
  lines.push(`  ${PASS} Passed: ${passed}`);
  lines.push(`  ${FAIL} Failed: ${failed}`);

  for (const result of results.filter((r) => !r.passed)) {
    lines.push(`\n  ${result.snapshotName}: ${result.violations.length} violation(s)`);
    for (const v of result.violations) {
      lines.push(`    - [${v.rule}] ${v.key}`);
    }
  }

  return lines.join('\n');
}

export function listBuiltinRuleDescriptions(rules: { name: string; description: string }[]): string {
  const lines = ['Available validation rules:'];
  for (const rule of rules) {
    lines.push(`  • ${rule.name}: ${rule.description}`);
  }
  return lines.join('\n');
}
