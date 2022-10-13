import { wait } from '../testing';
import { CustomElement, CustomHTMLElement, Composition } from '../';

describe('CustomElement', () => {
  it('should have a public API', () => {
    expect(CustomElement).toBeDefined();
    expect(globalThis.CustomElement).toBe(CustomElement);

    const composer = new CustomElement();
    expect(composer.create).toBeDefined();
    expect(composer.define).toBeDefined();
    expect(composer.use).toBeDefined();
  });

  it('should define a custom element class', () => {
    const tag = 'x-custom' + Math.random();
    const composer = new CustomElement();
    const ElementClass = composer.define(class extends HTMLElement {}, { tag });

    const instance = composer.createElement(ElementClass);
    document.body.appendChild(instance);

    expect(customElements.get(tag)).not.toBeUndefined();
    expect(instance.parentComponent).toBe(null);
    expect(instance[CustomElement.tag]).toBe(true);
    expect(CustomElement.isCustomElement(instance)).toBe(true);
  });

  it('should allow plugin registration', async () => {
    class Plugin<T extends CustomHTMLElement> implements Composition<T> {}
    const plugin = new Plugin();
    const composer = new CustomElement().use(plugin);

    expect(() => composer.create(class extends HTMLElement {}, { tag: 'x-foo' })).not.toThrow();
  });

  it('should allow extensions via plugins', async () => {
    const tag = 'x-custom' + Math.random();
    const sequence = [];
    const spy = (name) => jasmine.createSpy(name).and.callFake(() => sequence.push(name));

    interface PluginOptions {
      option: boolean;
    }

    interface Extension {
      foo: number;
    }

    class Plugin<T extends CustomHTMLElement> implements Composition<T, Extension, PluginOptions> {
      onCreate = spy('onCreate').and.callFake((element) => {
        sequence.push('onCreate');
        element.foo = 123;
      });
      onConnect = spy('onConnect');
      onInit = spy('onInit');
      onDisconnect = spy('onDisconnect');
      onMove = spy('onMove');
    }

    const plugin = new Plugin();
    const composer = new CustomElement().use(plugin);

    const options = { tag, template: `<div/>`, option: true };
    const ElementClass = composer.define(
      class extends HTMLElement {
        onInit = spy('onInit element');
        onDestroy = spy('onDestroy element');
      },
      options,
    );

    const element = document.createElement(tag);
    // const element = composer.createElement(ElementClass);
    const newParent = document.createElement('div');

    document.body.appendChild(element);
    document.body.appendChild(newParent);

    await wait(20);

    expect(plugin.onCreate).toHaveBeenCalledWith(element, options);
    expect(plugin.onConnect).toHaveBeenCalledWith(element, options);
    expect(plugin.onInit).toHaveBeenCalledWith(element, options);
    expect(element.onInit).toHaveBeenCalledWith();

    newParent.append(element);
    element.remove();

    expect(plugin.onDisconnect).toHaveBeenCalledWith(element, undefined);
    expect(element.onDestroy).toHaveBeenCalledWith();

    expect(element.foo).toBe(123);
    expect(sequence).toEqual([
      'onCreate',
      'onConnect',
      'onInit',
      'onInit element',
      'onMove',
      'onDestroy element',
      'onDisconnect',
    ]);
  });
});
