import { Internals } from './custom-element-internals';
import {
  CustomElementPlugin,
  CustomElementOptions,
  customElement,
  CustomHTMLElement,
  CustomElementInstance,
} from './types';

export class CustomElement {
  static readonly tag = customElement;

  constructor(private internals = new Internals()) {}

  get nextTick() {
    return this.internals.nextTick;
  }

  static isCustomElement(target: any): target is CustomHTMLElement {
    return target && target[customElement];
  }

  using<C extends CustomHTMLElement, O extends CustomElementOptions>(next: CustomElementPlugin<C, O>) {
    this.internals = this.internals.using(next);
    return this;
  }

  define<C extends typeof HTMLElement, O extends CustomElementOptions>(ComponentClass: C, options: O) {
    const Constructor = this.create(ComponentClass, options);
    const defineOptions = options.extends ? { extends: options.extends } : undefined;

    this.internals.onDefine(Constructor, options);

    globalThis.customElements.define(options.tag, Constructor, defineOptions);

    return Constructor;
  }

  get(name: string) {
    return globalThis.customElements.get(name);
  }

  createElement<T extends typeof HTMLElement>(
    constructor: T,
    properties?: Record<string, any>,
  ): CustomElementInstance<T> | null {
    const options = constructor[customElement];

    if (options) {
      const element = document.createElement(options.tag);
      Object.assign(element, properties || {});
      return element;
    }

    return null;
  }

  create<C extends typeof HTMLElement, O extends CustomElementOptions>(
    ComponentClass: C,
    options: O,
  ): C & typeof CustomHTMLElement {
    // add the same static to both the new constructor and the original one,
    // so the consumers can use the original class to access CustomElements API
    ComponentClass[customElement] = options;
    const internals = this.internals;
    const customElements = this;

    // @ts-ignore
    return class Constructor extends ComponentClass {
      static [customElement] = options;

      [customElement] = false;
      parentComponent = null;

      constructor() {
        super();
        internals.onCreate(this as unknown as CustomHTMLElement, options);
      }

      connectedCallback() {
        internals.onConnect(this, options);
      }

      disconnectedCallback() {
        internals.onDisconnect(this);
      }

      createElement<T extends typeof HTMLElement>(constructor: T): CustomElementInstance<T> {
        const instance = customElements.createElement(constructor);
        this.append(instance);

        return instance;
      }
    };
  }
}

globalThis.CustomElement = CustomElement;

const defaultCustomElements = new CustomElement();
const define = defaultCustomElements.define.bind(defaultCustomElements)
const create = defaultCustomElements.create.bind(defaultCustomElements);
const createElement = defaultCustomElements.createElement.bind(defaultCustomElements);
const using = defaultCustomElements.using.bind(defaultCustomElements);

export {
  define,
  create,
  createElement,
  using
};

export { defaultCustomElements as customElements };
