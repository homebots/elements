import { Provider, TreeInjector as Injector } from '@homebots/injector';

export interface ComponentOptions {
  tag: string;
  template?: string;
  styles?: string;
  shadowDom?: boolean | ShadowRootInit;
  extensionOptions?: { extends: string };
  providers?: Provider[];
  parentInjector?: Injector;
}

export type LifecycleHook = () => void;

const customElementsTag = Symbol('CustomElement');

export interface CustomHTMLElement extends HTMLElement {
  readonly parentComponent: CustomHTMLElement;
  readonly [customElementsTag]: true;

  [key: string | number | symbol]: any;

  onInit?: LifecycleHook;
  onDestroy?: LifecycleHook;
}

export class CustomElementPlugin {
  onCreate(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onBeforeInit(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onInit(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onDestroy(_element: CustomHTMLElement): void {}
  onError(_element: CustomHTMLElement, _error: any): void {}
}

export class CustomElement {
  static plugins: CustomElementPlugin[] = [];
  static tag = customElementsTag;

  static use(plugin: CustomElementPlugin) {
    CustomElement.plugins.push(plugin);
    return CustomElement;
  }

  static isCustomElement(target: any) {
    return target && target[customElementsTag];
  }

  static define(ComponentClass: typeof HTMLElement, options: ComponentOptions) {
    const customElement = CustomElement.create(ComponentClass, options);
    customElements.define(options.tag, customElement, options.extensionOptions);
  }

  static create(ComponentClass: typeof HTMLElement, options: ComponentOptions) {
    const customElement = class extends ComponentClass implements CustomHTMLElement {
      readonly [customElementsTag] = true;
      parentComponent: CustomHTMLElement;

      constructor() {
        super();
        try {
          CustomElementInternal.onCreate(this, options);
        } catch (error) {
          CustomElementInternal.onError(this, error);
        }
      }

      connectedCallback() {
        if (!this.isConnected) {
          return;
        }

        const parentComponent = CustomElementInternal.findParentComponent(this);
        const skipCreation = parentComponent === this.parentComponent;

        if (skipCreation) {
          return;
        }

        this.parentComponent = parentComponent;
        CustomElementInternal.onBeforeInit(this, options);
      }

      disconnectedCallback() {
        if (this.isConnected) {
          return;
        }

        CustomElementInternal.onDestroy(this);
      }
    };

    return customElement;
  }
}

export class CustomElementInternal {
  static findParentComponent(component: CustomHTMLElement): CustomHTMLElement | null {
    let parentComponent: any = component;

    while (parentComponent && (parentComponent = parentComponent.parentNode || parentComponent.host)) {
      if (parentComponent[customElementsTag]) {
        return parentComponent;
      }
    }

    return null;
  }

  static onCreate(element: CustomHTMLElement, options: ComponentOptions) {
    CustomElement.plugins.forEach((plugin) => plugin.onCreate(element, options));
  }

  private static queue: Array<[element: CustomHTMLElement, options: ComponentOptions]> = [];
  static queueTimer;
  static queueTick() {
    clearTimeout(this.queueTimer);
    this.queueTimer = setTimeout(() => this.onInit(), 10);
  }

  static onBeforeInit(element: CustomHTMLElement, options: ComponentOptions) {
    CustomElementInternal.queue.push([element, options]);
    CustomElementInternal.queueTick();

    try {
      CustomElement.plugins.forEach((plugin) => plugin.onBeforeInit(element, options));
    } catch (error) {
      CustomElementInternal.onError(element, error);
    }
  }

  static onInit() {
    CustomElementInternal.queue.forEach(([element, options]) => {
      CustomElement.plugins.forEach((plugin) => plugin.onInit(element, options));
      element.onInit && element.onInit();
    });

    CustomElementInternal.queue = [];
  }

  static onDestroy(element: CustomHTMLElement) {
    element.onDestroy && element.onDestroy();

    CustomElement.plugins.forEach((plugin) => plugin.onDestroy(element));
  }

  static onError(element: CustomHTMLElement, error: any) {
    console.error(element, error);
    CustomElement.plugins.forEach((plugin) => plugin.onError(element, error));
  }
}
