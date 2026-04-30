import { lintSnapshot, getBuiltinLintRules, LintRule } from './lint';
import { Snapshot } from '../snapshot/index';

function makeSnapshot(vars: Record<string, string>): Snapshot {
  return {
    id: 'snap-test-001',
    createdAt: new Date().toISOString(),
    vars,
  };
}

describe('getBuiltinLintRules', () => {
  it('returns an array of rules', () => {
    const rules = getBuiltinLintRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((r) => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('severity');
      expect(r).toHaveProperty('check');
    });
  });
});

describe('lintSnapshot', () => {
  it('returns no issues for a clean snapshot', () => {
    const snapshot = makeSnapshot({ NODE_ENV: 'production', PORT: '3000' });
    const result = lintSnapshot(snapshot);
    expect(result.issues).toHaveLength(0);
    expect(result.failed).toBe(0);
    expect(result.passed).toBeGreaterThan(0);
  });

  it('flags empty values with no-empty-value rule', () => {
    const snapshot = makeSnapshot({ NODE_ENV: '' });
    const result = lintSnapshot(snapshot);
    const issue = result.issues.find((i) => i.ruleId === 'no-empty-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags lowercase keys with uppercase-key rule', () => {
    const snapshot = makeSnapshot({ port: '3000' });
    const result = lintSnapshot(snapshot);
    const issue = result.issues.find((i) => i.ruleId === 'uppercase-key');
    expect(issue).toBeDefined();
    expect(issue?.key).toBe('port');
  });

  it('flags keys with whitespace', () => {
    const snapshot = makeSnapshot({ 'MY KEY': 'value' });
    const result = lintSnapshot(snapshot);
    const issue = result.issues.find((i) => i.ruleId === 'no-whitespace-key');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('flags secret keys with short values', () => {
    const snapshot = makeSnapshot({ API_SECRET: 'abc' });
    const result = lintSnapshot(snapshot);
    const issue = result.issues.find((i) => i.ruleId === 'no-secret-plaintext');
    expect(issue).toBeDefined();
  });

  it('does not flag secret keys with sufficiently long values', () => {
    const snapshot = makeSnapshot({ API_SECRET: 'a-very-long-secret-value' });
    const result = lintSnapshot(snapshot);
    const issue = result.issues.find((i) => i.ruleId === 'no-secret-plaintext');
    expect(issue).toBeUndefined();
  });

  it('respects custom rules', () => {
    const customRule: LintRule = {
      id: 'no-localhost',
      description: 'Values should not reference localhost',
      severity: 'warn',
      check: (_key, value) => !value.includes('localhost'),
      message: (key) => `"${key}" references localhost`,
    };
    const snapshot = makeSnapshot({ DATABASE_URL: 'http://localhost:5432' });
    const result = lintSnapshot(snapshot, [customRule]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].ruleId).toBe('no-localhost');
  });

  it('sets snapshotId on result', () => {
    const snapshot = makeSnapshot({ FOO: 'bar' });
    const result = lintSnapshot(snapshot);
    expect(result.snapshotId).toBe('snap-test-001');
  });
});
