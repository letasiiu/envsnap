import { formatValidationResult, formatValidationSummary, listBuiltinRuleDescriptions } from './formatValidate';
import { ValidationResult } from './validate';

function makeResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
  return {
    snapshotId: 'snap-001',
    snapshotName: 'my-snap',
    passed: true,
    violations: [],
    ...overrides,
  };
}

describe('formatValidationResult', () => {
  it('shows PASSED for a clean result', () => {
    const output = formatValidationResult(makeResult());
    expect(output).toContain('PASSED');
    expect(output).toContain('my-snap');
    expect(output).toContain('All checks passed.');
  });

  it('shows FAILED and lists violations', () => {
    const result = makeResult({
      passed: false,
      violations: [
        { key: 'SECRET', value: 'changeme', rule: 'no-secret-in-plain', description: 'Weak secret' },
      ],
    });
    const output = formatValidationResult(result);
    expect(output).toContain('FAILED');
    expect(output).toContain('no-secret-in-plain');
    expect(output).toContain('SECRET');
    expect(output).toContain('Violations (1)');
  });
});

describe('formatValidationSummary', () => {
  it('summarizes multiple results', () => {
    const results = [
      makeResult({ snapshotName: 'snap-a', passed: true }),
      makeResult({
        snapshotName: 'snap-b',
        passed: false,
        violations: [
          { key: 'FOO', value: '', rule: 'no-empty-value', description: 'Empty' },
        ],
      }),
    ];
    const output = formatValidationSummary(results);
    expect(output).toContain('2 snapshot(s)');
    expect(output).toContain('Passed: 1');
    expect(output).toContain('Failed: 1');
    expect(output).toContain('snap-b');
    expect(output).toContain('no-empty-value');
  });
});

describe('listBuiltinRuleDescriptions', () => {
  it('lists all rule names and descriptions', () => {
    const rules = [
      { name: 'rule-a', description: 'Desc A' },
      { name: 'rule-b', description: 'Desc B' },
    ];
    const output = listBuiltinRuleDescriptions(rules);
    expect(output).toContain('rule-a');
    expect(output).toContain('Desc A');
    expect(output).toContain('rule-b');
  });
});
