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

export interface OnInit {
  onInit: LifecycleHook;
}

export interface OnDestroy {
  onDestroy: LifecycleHook;
}

const plugins: CustomElementPlugin[] = [];
const customElementsTag = Symbol('CustomElement');

export interface CustomHTMLElement extends HTMLElement {
  readonly parentComponent: CustomHTMLElement;
  readonly [customElementsTag]: true;

  onInit?: LifecycleHook;
  onDestroy?: LifecycleHook;
}

export class CustomElementPlugin {
  onCreate(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onInit(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onDestroy(_element: CustomHTMLElement): void {}
  onError(_element: CustomHTMLElement, _error: any): void {}
}

export class CustomElement {
  static tag = customElementsTag;
  static use(plugin: CustomElementPlugin) {
    plugins.push(plugin);
    return CustomElement;
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

        try {
          CustomElementInternal.onInit(this, options);
        } catch (error) {
          CustomElementInternal.onError(this, error);
        }
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
    plugins.forEach((plugin) => plugin.onCreate(element, options));
  }

  static onInit(element: CustomHTMLElement, options: ComponentOptions) {
    plugins.forEach((plugin) => plugin.onInit(element, options));

    element.onInit?.();
  }

  static onDestroy(element: CustomHTMLElement) {
    element.onDestroy?.();

    plugins.forEach((plugin) => plugin.onDestroy(element));
  }

  static onError(element: CustomHTMLElement, error: any) {
    console.error(error);
    plugins.forEach((plugin) => plugin.onError(element, error));
  }
}
