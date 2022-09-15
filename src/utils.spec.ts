import { noop } from '.';

describe('utilities', () => {
  it('exports a noop', () => {
    expect(noop()).toBe(undefined);
  });
});
