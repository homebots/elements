import {
  CustomElement,
  customElements,
  CustomHTMLElement,
  CustomElementPlugin,
  create,
  define,
  createElement,
  using,
} from '../';

describe('CustomElement', () => {
  it('should have a public API', () => {
    expect(globalThis.CustomElement).toBe(CustomElement);
    const customElements = new CustomElement();
    expect(customElements.create).toBeDefined();
    expect(customElements.define).toBeDefined();
    expect(customElements.createElement).toBeDefined();
    expect(customElements.using).toBeDefined();
  });

  it('should have a public functional API', () => {
    expect(customElements).toBeDefined();

    expect(create).toBeDefined();
    expect(define).toBeDefined();
    expect(createElement).toBeDefined();
    expect(using).toBeDefined();
  });

  it('should create a custom element class and define it as a custom element', () => {
    const tag = 'x-custom' + Math.random();
    class ElementClass extends HTMLElement {}
    const ElementConstructor = customElements.define(ElementClass, { tag });

    const instance = customElements.createElement(ElementClass, { title: 'test' });
    document.body.appendChild(instance);

    expect(globalThis.customElements.get(tag)).toBe(ElementConstructor);
    expect(instance.parentComponent).toBe(null);
    expect(instance[CustomElement.tag]).toBe(true);
    expect(CustomElement.isCustomElement(instance)).toBe(true);

    instance.createElement(ElementClass);
    expect(instance.firstChild instanceof ElementClass).toBe(true);
  });

  it('should allow plugin registration', async () => {
    class Plugin<T extends CustomHTMLElement> implements CustomElementPlugin<T> {}

    const plugin = new Plugin();
    expect(() => customElements.using(plugin)).not.toThrow();
  });

  it('should allow extensions via plugins', async () => {
    const tag = 'x-custom' + Math.random();
    const sequence = [];
    const spy = (name) => jasmine.createSpy(name).and.callFake(() => sequence.push(name));

    interface PluginOptions {
      option: boolean;
    }

    class Plugin<T extends CustomHTMLElement> implements CustomElementPlugin<T, PluginOptions> {
      onCreate = spy('onCreate').and.callFake((element, options) => {
        sequence.push('onCreate');
        element.foo = options.foo;
      });
      onConnect = spy('onConnect');
      onInit = spy('onInit');
      onDisconnect = spy('onDisconnect');
      onMove = spy('onMove');
      onDefine = spy('onDefine');
    }

    const plugin = new Plugin();
    const customElementsWithPlugin = new CustomElement().using(plugin);
    const options = { tag, foo: 123 };
    class ElementClass extends HTMLElement {
      foo: number;
      onInit = spy('onInit element');
      onDestroy = spy('onDestroy element');
    }

    const Constructor = customElementsWithPlugin.define(ElementClass, options);

    const element = customElementsWithPlugin.createElement(ElementClass);
    const newParent = document.createElement('div');

    document.body.appendChild(element);
    document.body.appendChild(newParent);

    await customElementsWithPlugin.nextTick;

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
      'onDefine',
      'onCreate',
      'onConnect',
      'onInit',
      'onInit element',
      'onMove',
      'onDestroy element',
      'onDisconnect',
    ]);

    expect(plugin.onDefine).toHaveBeenCalledWith(Constructor, options);
  });
});
