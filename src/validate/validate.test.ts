import { validateSnapshot, getBuiltinRules, ValidationRule } from './validate';
import { Snapshot } from '../snapshot/index';

function makeSnapshot(env: Record<string, string>): Snapshot {
  return {
    id: 'snap-test-001',
    name: 'test-snapshot',
    createdAt: new Date().toISOString(),
    env,
  };
}

describe('validateSnapshot', () => {
  it('passes a clean snapshot', () => {
    const snap = makeSnapshot({ NODE_ENV: 'production', PORT: '3000' });
    const result = validateSnapshot(snap);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('detects empty value violation', () => {
    const snap = makeSnapshot({ NODE_ENV: '' });
    const result = validateSnapshot(snap);
    expect(result.passed).toBe(false);
    const rules = result.violations.map((v) => v.rule);
    expect(rules).toContain('no-empty-value');
  });

  it('detects lowercase key violation', () => {
    const snap = makeSnapshot({ node_env: 'production' });
    const result = validateSnapshot(snap);
    expect(result.passed).toBe(false);
    const rules = result.violations.map((v) => v.rule);
    expect(rules).toContain('uppercase-key');
  });

  it('detects weak secret value', () => {
    const snap = makeSnapshot({ API_TOKEN: 'changeme' });
    const result = validateSnapshot(snap);
    expect(result.passed).toBe(false);
    const rules = result.violations.map((v) => v.rule);
    expect(rules).toContain('no-secret-in-plain');
  });

  it('allows custom rules', () => {
    const customRule: ValidationRule = {
      name: 'must-start-with-app',
      description: 'Keys must start with APP_',
      check: (key) => key.startsWith('APP_'),
    };
    const snap = makeSnapshot({ NODE_ENV: 'production' });
    const result = validateSnapshot(snap, [customRule]);
    expect(result.passed).toBe(false);
    expect(result.violations[0].rule).toBe('must-start-with-app');
  });

  it('returns correct snapshotId and name', () => {
    const snap = makeSnapshot({ APP_ENV: 'staging' });
    const result = validateSnapshot(snap);
    expect(result.snapshotId).toBe('snap-test-001');
    expect(result.snapshotName).toBe('test-snapshot');
  });
});

describe('getBuiltinRules', () => {
  it('returns an array of rules', () => {
    const rules = getBuiltinRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it('each rule has name, description, and check function', () => {
    for (const rule of getBuiltinRules()) {
      expect(typeof rule.name).toBe('string');
      expect(typeof rule.description).toBe('string');
      expect(typeof rule.check).toBe('function');
    }
  });
});
