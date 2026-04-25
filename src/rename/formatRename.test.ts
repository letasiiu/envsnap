import { formatRenameResult, formatRenameError, formatRenameHelp } from './formatRename';
import { RenameResult } from './rename';

describe('formatRenameResult', () => {
  it('formats a successful rename', () => {
    const result: RenameResult = { oldName: 'alpha', newName: 'beta', success: true };
    const output = formatRenameResult(result);
    expect(output).toContain('✓');
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    expect(output).toContain('→');
  });

  it('formats a failed rename', () => {
    const result: RenameResult = {
      oldName: 'alpha',
      newName: 'beta',
      success: false,
      error: 'Snapshot "alpha" not found.'
    };
    const output = formatRenameResult(result);
    expect(output).toContain('✗');
    expect(output).toContain('not found');
  });
});

describe('formatRenameError', () => {
  it('includes old name, new name, and error message', () => {
    const output = formatRenameError('foo', 'bar', 'something went wrong');
    expect(output).toContain('foo');
    expect(output).toContain('bar');
    expect(output).toContain('something went wrong');
  });
});

describe('formatRenameHelp', () => {
  it('includes usage line', () => {
    const help = formatRenameHelp();
    expect(help).toContain('envsnap rename');
  });

  it('mentions tag transfer behavior', () => {
    const help = formatRenameHelp();
    expect(help.toLowerCase()).toContain('tag');
  });

  it('mentions history recording', () => {
    const help = formatRenameHelp();
    expect(help.toLowerCase()).toContain('history');
  });
});
