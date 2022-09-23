import { CustomElement, CustomHTMLElement } from '.';

describe('CustomElement', () => {
  it('should define a custom element class', () => {
    const tag = 'x-custom' + Math.random();
    CustomElement.define(class extends HTMLElement {}, { tag });
    const instance = document.createElement(tag) as CustomHTMLElement;

    expect(customElements.get(tag)).not.toBeUndefined();
    expect(typeof instance.onInit).toBe('function');
    expect(typeof instance.onDestroy).toBe('function');
    expect(typeof instance.onBeforeCheck).toBe('function');
    expect(typeof instance.onChanges).toBe('function');
  });
});
