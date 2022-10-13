import { Composition, CustomElementOptions, isCustomElement, tag, CustomHTMLElement } from './types';

type ConstructorType<T> = T extends { new (): infer R } ? R : never;

export class CustomElement<
  Target extends CustomHTMLElement,
  Extension extends {},
  Options extends CustomElementOptions,
> {
  static readonly tag = isCustomElement;

  static isCustomElement(target: any): target is CustomHTMLElement {
    return target && target[isCustomElement];
  }

  static findParentComponent(component: CustomHTMLElement): CustomHTMLElement | null {
    let parentComponent: any = component;

    while (parentComponent && (parentComponent = parentComponent.parentNode || parentComponent.host)) {
      if (parentComponent[isCustomElement]) {
        return parentComponent;
      }
    }

    return null;
  }

  private readonly compositions: Composition<any, any, any>[] = [];

  use<Extension2 extends {}, Options2 extends {}>(next: Composition<Target, Extension2, Options2>) {
    this.compositions.push(next);
    return this as unknown as CustomElement<Target, Extension & Extension2, Options & Options2>;
  }

  define(ComponentClass: typeof HTMLElement, options: Options) {
    const customElement = this.create(ComponentClass, options);
    const defineOptions = options.extends ? { extends: options.extends } : undefined;

    customElements.define(options.tag, customElement, defineOptions);
    customElement.prototype[tag] = options.tag;

    return customElement;
  }

  createElement<T extends typeof CustomHTMLElement>(cls: T): ConstructorType<T> {
    return document.createElement(cls.prototype[tag]);
  }

  create(ComponentClass: typeof HTMLElement, options: Options) {
    const composer: CustomElement<Target, Extension, Options> = this;

    return class CustomElementConstructor extends ComponentClass implements CustomHTMLElement {
      [isCustomElement] = false;
      parentComponent: CustomHTMLElement | null = null;

      constructor() {
        super();
        composer.onCreate(this, options);
      }

      connectedCallback() {
        composer.onConnect(this, options);
      }

      disconnectedCallback() {
        composer.onDisconnect(this);
      }
    };
  }

  protected apply<C>(target: C, method: string, options?: Options, ...args: any[]) {
    try {
      this.compositions.forEach((p) => p[method] && p[method](target, options, ...args));
    } catch (error) {
      this.compositions.forEach((p) => p.onError && p.onError(target, error));
    }

    return target as C & Extension;
  }

  private queue: Array<[element: CustomHTMLElement, options: Options]> = [];
  private queueTimer;
  private queueTick() {
    if (!this.queueTimer) {
      this.queueTimer = setTimeout(() => this.onInit(), 16);
    }
  }

  protected onInit() {
    this.queue.forEach(([element, options]) => {
      this.apply(element, 'onInit', options);
      element.onInit && element.onInit();
    });

    this.queue = [];
    this.queueTimer = 0;
  }

  protected onConnect<T extends CustomHTMLElement>(element: T, options: Options) {
    if (!element.isConnected) {
      return;
    }

    const parentComponent = CustomElement.findParentComponent(element);
    if (element[isCustomElement]) {
      this.onMove(element, options, element.parentComponent, parentComponent);
      return;
    }

    element[isCustomElement] = true;
    element.parentComponent = parentComponent;
    this.queue.push([element, options]);
    this.queueTick();

    try {
      this.apply(element, 'onConnect', options);
    } catch (error) {
      this.onError(element, error);
    }
  }

  protected onDisconnect<T extends CustomHTMLElement>(element: T) {
    if (element.isConnected) {
      return;
    }

    this.queue = this.queue.filter((next) => next[0] !== element);
    element.onDestroy && element.onDestroy();
    this.apply(element, 'onDisconnect');
  }

  protected onError<T extends CustomHTMLElement>(element: T, error: any) {
    console.error(element, error);
    this.apply(element, 'onError', null, error);
  }

  protected onCreate<T extends CustomHTMLElement>(element: T, options: Options) {
    this.apply(element, 'onCreate', options);
  }

  protected onMove<T extends CustomHTMLElement>(
    element: T,
    options: Options,
    oldParent: CustomHTMLElement | null,
    newParent: CustomHTMLElement | null,
  ) {
    this.apply(element, 'onMove', options, oldParent, newParent);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.CustomElement = CustomElement;
}

export const defaults = new CustomElement();
