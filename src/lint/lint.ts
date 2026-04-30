import { Snapshot } from '../snapshot/index';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintRule {
  id: string;
  description: string;
  severity: LintSeverity;
  check: (key: string, value: string) => boolean;
  message: (key: string, value: string) => string;
}

export interface LintIssue {
  ruleId: string;
  severity: LintSeverity;
  key: string;
  value: string;
  message: string;
}

export interface LintResult {
  snapshotId: string;
  issues: LintIssue[];
  passed: number;
  failed: number;
}

export function getBuiltinLintRules(): LintRule[] {
  return [
    {
      id: 'no-empty-value',
      description: 'Environment variable should not have an empty value',
      severity: 'warn',
      check: (_key, value) => value.trim().length > 0,
      message: (key) => `"${key}" has an empty value`,
    },
    {
      id: 'no-whitespace-key',
      description: 'Environment variable key should not contain whitespace',
      severity: 'error',
      check: (key) => !/\s/.test(key),
      message: (key) => `"${key}" contains whitespace in key name`,
    },
    {
      id: 'uppercase-key',
      description: 'Environment variable key should be uppercase',
      severity: 'warn',
      check: (key) => key === key.toUpperCase(),
      message: (key) => `"${key}" is not uppercase`,
    },
    {
      id: 'no-secret-plaintext',
      description: 'Keys suggesting secrets should not have short values',
      severity: 'warn',
      check: (key, value) => {
        const secretPattern = /SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE/i;
        return !secretPattern.test(key) || value.length >= 8;
      },
      message: (key) => `"${key}" looks like a secret but has a suspiciously short value`,
    },
  ];
}

export function lintSnapshot(snapshot: Snapshot, rules?: LintRule[]): LintResult {
  const activeRules = rules ?? getBuiltinLintRules();
  const issues: LintIssue[] = [];
  let passed = 0;

  for (const [key, value] of Object.entries(snapshot.vars)) {
    for (const rule of activeRules) {
      if (!rule.check(key, value)) {
        issues.push({
          ruleId: rule.id,
          severity: rule.severity,
          key,
          value,
          message: rule.message(key, value),
        });
      } else {
        passed++;
      }
    }
  }

  return {
    snapshotId: snapshot.id,
    issues,
    passed,
    failed: issues.length,
  };
}
