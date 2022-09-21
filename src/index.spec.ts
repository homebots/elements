import { CustomElement } from './index';

describe('CustomElement', () => {
  it('should have a public API', () => {
    expect(CustomElement).toBeDefined();
    expect(CustomElement.create).toBeDefined();
    expect(CustomElement.define).toBeDefined();
    expect(CustomElement.use).toBeDefined();
  });
});
