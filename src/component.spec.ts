import { CustomElement, CustomHTMLElement } from '.';

describe('CustomElement', () => {
  it('should define a custom element class', () => {
    const tag = 'x-custom' + Math.random();
    CustomElement.define(class extends HTMLElement {}, { tag });
    const instance = document.createElement(tag) as CustomHTMLElement;

    expect(customElements.get(tag)).not.toBeUndefined();
    expect(instance[CustomElement.tag]).toBe(true);
  });
});
