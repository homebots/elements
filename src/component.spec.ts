import { CustomElement } from '.';

describe('CustomElement', () => {
  it('should create a custom element class', () => {
    const customElement = CustomElement.create(class extends HTMLElement {}, { tag: 'x-custom' });
    const instance = document.createElement('x-custom') as any;

    expect(typeof customElement).toBe('function');
    expect(instance.onInit).toBe('function');
    expect(instance.onDestroy).toBe('function');
    expect(instance.onBeforeCheck).toBe('function');
    expect(instance.onChanges).toBe('function');
  });
});
