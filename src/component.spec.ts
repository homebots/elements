import { CustomElement } from '.';

describe('CustomElement', () => {
  it('should create a custom element class', () => {
    const customElement = CustomElement.create(class extends HTMLElement {}, { tag: '' });
    expect(typeof customElement).toBe('function');
  });
});
