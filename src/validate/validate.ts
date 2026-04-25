import { Snapshot } from '../snapshot/index';

export interface ValidationRule {
  name: string;
  description: string;
  check: (key: string, value: string) => boolean;
}

export interface ValidationResult {
  snapshotId: string;
  snapshotName: string;
  passed: boolean;
  violations: ValidationViolation[];
}

export interface ValidationViolation {
  key: string;
  value: string;
  rule: string;
  description: string;
}

const builtinRules: ValidationRule[] = [
  {
    name: 'no-empty-value',
    description: 'Environment variable must not have an empty value',
    check: (_key, value) => value.trim().length > 0,
  },
  {
    name: 'no-whitespace-key',
    description: 'Environment variable key must not contain whitespace',
    check: (key) => !/\s/.test(key),
  },
  {
    name: 'uppercase-key',
    description: 'Environment variable key should be uppercase',
    check: (key) => key === key.toUpperCase(),
  },
  {
    name: 'no-secret-in-plain',
    description: 'Keys suggesting secrets should not have obviously weak values',
    check: (key, value) => {
      const secretPattern = /(secret|password|token|api_key)/i;
      const weakValues = ['', 'changeme', 'password', '1234', 'secret', 'test'];
      if (secretPattern.test(key)) {
        return !weakValues.includes(value.toLowerCase());
      }
      return true;
    },
  },
];

export function validateSnapshot(
  snapshot: Snapshot,
  rules: ValidationRule[] = builtinRules
): ValidationResult {
  const violations: ValidationViolation[] = [];

  for (const [key, value] of Object.entries(snapshot.env)) {
    for (const rule of rules) {
      if (!rule.check(key, value)) {
        violations.push({ key, value, rule: rule.name, description: rule.description });
      }
    }
  }

  return {
    snapshotId: snapshot.id,
    snapshotName: snapshot.name,
    passed: violations.length === 0,
    violations,
  };
}

export function getBuiltinRules(): ValidationRule[] {
  return builtinRules;
}
