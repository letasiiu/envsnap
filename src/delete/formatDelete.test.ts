import { formatDeleteResult, formatDeleteError, formatDeleteHelp } from './formatDelete';

describe('formatDeleteResult', () => {
  it('returns success message with snapshot name', () => {
    const result = formatDeleteResult('my-snapshot');
    expect(result).toContain('my-snapshot');
    expect(result).toContain('deleted');
  });

  it('includes checkmark or success indicator', () => {
    const result = formatDeleteResult('prod-env');
    expect(result).toMatch(/✓|deleted|success/i);
  });
});

describe('formatDeleteError', () => {
  it('returns error message when snapshot not found', () => {
    const result = formatDeleteError('ghost-snap', 'not found');
    expect(result).toContain('ghost-snap');
    expect(result).toMatch(/error|not found/i);
  });

  it('includes the reason in the output', () => {
    const result = formatDeleteError('snap', 'permission denied');
    expect(result).toContain('permission denied');
  });
});

describe('formatDeleteHelp', () => {
  it('returns usage instructions', () => {
    const result = formatDeleteHelp();
    expect(result).toMatch(/usage|delete/i);
  });

  it('mentions the --force flag', () => {
    const result = formatDeleteHelp();
    expect(result).toContain('--force');
  });
});
