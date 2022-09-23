import { ChangeDetectorRef, Changes, ChangesCallback } from './change-detection/change-detection';
import { ReactiveChangeDetector } from './change-detection/reactive-change-detector';
import { ExecutionContext } from './execution-context';
import { noop } from './utils';
import { DomScanner } from './dom/dom-scanner';
import { InjectionToken, TreeInjector as Injector, Provider, Value } from '@homebots/injector';
import { ShadowDomToggle } from './settings';
import { Dom } from './dom/dom';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };
let isAttachingNodesToSlot = false;

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

export interface OnBeforeCheck {
  onBeforeCheck: LifecycleHook;
}

export const TemplateRef = new InjectionToken<HTMLTemplateElement>('TemplateRef');

export interface CustomHTMLElement extends HTMLElement {
  readonly parentComponent: CustomHTMLElement;

  onInit: LifecycleHook;
  onDestroy: LifecycleHook;
  onBeforeCheck: LifecycleHook;
  onChanges: ChangesCallback;
}

export class CustomElementPlugin {
  onInit(_element: CustomHTMLElement, _options: ComponentOptions): void {}
  onDestroy(_element: CustomHTMLElement): void {}
  onError(_element: CustomHTMLElement, _error: any): void {}
}

const lifeCycleHooks = ['onInit', 'onDestroy', 'onChanges', 'onBeforeCheck'];
const plugins: CustomElementPlugin[] = [];

export class CustomElement {
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
      parentComponent: CustomHTMLElement;

      onInit: LifecycleHook;
      onDestroy: LifecycleHook;
      onBeforeCheck: LifecycleHook;
      onChanges: ChangesCallback;

      connectedCallback() {
        if (!this.isConnected) {
          return;
        }

        const parentComponent = CustomElementInternal.findParentComponent(this);
        const skipCreation = parentComponent === this.parentComponent || isAttachingNodesToSlot;

        if (skipCreation) {
          return;
        }

        this.parentComponent = parentComponent;

        try {
          CustomElementInternal.onInit(this, options);
          this.onInit();
        } catch (error) {
          CustomElementInternal.onError(this, options);
        }
      }

      disconnectedCallback() {
        if (this.isConnected) {
          return;
        }

        this.onDestroy();
        CustomElementInternal.onDestroy(this);
      }
    };

    CustomElementInternal.addLifeCycleHooks(customElement);

    return customElement;
  }
}

export class CustomElementInternal {
  static addLifeCycleHooks(target: any) {
    lifeCycleHooks.forEach((hook) => {
      if (!target.prototype[hook]) {
        target.prototype[hook] = noop;
      }
    });
  }

  static findParentComponent(component: CustomHTMLElement): CustomHTMLElement | null {
    let parentComponent: any = component;

    while (parentComponent && (parentComponent = parentComponent.parentNode || parentComponent.host)) {
      if (Injector.getInjectorOf(parentComponent)) {
        return parentComponent;
      }
    }

    return null;
  }

  static createComponentInjector(component: CustomHTMLElement, options: ComponentOptions) {
    const parent = options.parentInjector || Injector.getInjectorOf(component.parentComponent) || Injector.global;
    const injector = new Injector(parent);

    if (options.providers) {
      injector.provideAll(options.providers);
    }

    if (!injector.canProvide(ChangeDetectorRef)) {
      injector.provide(ChangeDetectorRef, ReactiveChangeDetector);
    } else {
      const localChangeDetector = injector.get(ChangeDetectorRef).fork(component);
      injector.provide(ChangeDetectorRef, Value(localChangeDetector));
    }

    if (options.shadowDom === undefined) {
      options.shadowDom = injector.get(ShadowDomToggle).enabled;
    }

    Injector.setInjectorOf(component, injector);

    return injector;
  }

  static setupChangeDetector(component: CustomHTMLElement) {
    const injector = Injector.getInjectorOf(component);
    const changeDetector = injector.get(ChangeDetectorRef).fork();
    const executionContext = new ExecutionContext(component);
    const dom = injector.get(DomScanner);

    Array.from(component.shadowRoot?.children || component.children).forEach((node) =>
      dom.scanTree(node as HTMLElement, changeDetector, executionContext),
    );

    changeDetector.beforeCheck(() => component.onBeforeCheck());
    changeDetector.afterCheck((changes: Changes) => changes.size && component.onChanges(changes));
    changeDetector.markAsDirtyAndCheck();
  }

  static teardownChangeDetector(component: CustomHTMLElement) {
    Injector.getInjectorOf(component).get(ChangeDetectorRef).unregister();
  }

  static createComponentTemplate(component: CustomHTMLElement, options: ComponentOptions) {
    const useShadowDom = options.shadowDom !== false;

    let templateText = options.template || '';
    if (options.styles) {
      templateText += `<style>${options.styles}</style>`;
    }

    const templateRef = Dom.createTemplateFromHtml(templateText);
    const templateContent = templateRef.content.cloneNode(true);
    Injector.getInjectorOf(component).provide(TemplateRef, Value(templateRef));

    if (useShadowDom) {
      const shadowDomOptions = (options.shadowDom !== true && options.shadowDom) || defaultShadowDomOptions;
      const shadowRoot = component.attachShadow(shadowDomOptions);
      shadowRoot.appendChild(templateContent);
      return;
    }

    const hasSlot = Boolean(templateRef.content.querySelector('slot'));

    if (hasSlot) {
      component.appendChild(templateContent);
      return;
    }

    const currentContentNodes = Array.from(component.children);
    component.append(templateContent);
    const slot = component.querySelector('slot');

    isAttachingNodesToSlot = true;
    currentContentNodes.forEach((node) => slot.append(node));
    isAttachingNodesToSlot = false;
  }

  static onInit(element: CustomHTMLElement, options: ComponentOptions) {
    CustomElementInternal.createComponentInjector(element, options);
    CustomElementInternal.createComponentTemplate(element, options);
    CustomElementInternal.setupChangeDetector(element);

    plugins.forEach((plugin) => plugin.onInit(element, options));
  }

  static onDestroy(element: CustomHTMLElement) {
    CustomElementInternal.teardownChangeDetector(element);

    plugins.forEach((plugin) => plugin.onDestroy(element));
  }

  static onError(element: CustomHTMLElement, error: any) {
    plugins.forEach((plugin) => plugin.onError(element, error));
  }
}
