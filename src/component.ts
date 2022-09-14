import { Subscription } from 'rxjs';
import { ChangeDetectorRef, Changes, ChangesCallback } from './change-detection/change-detection';
import { ReactiveChangeDetector } from './change-detection/reactive-change-detector';
import { ExecutionContext } from './execution-context';
import { noop } from './utils';
import { DomScanner } from './dom/dom-scanner';
import { InjectionToken, TreeInjector as Injector, Provider, Value } from '@homebots/injector';
import { ShadowDomToggle } from './settings';
import { Dom } from './dom/dom';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };

export interface HostAttributes {
  [attribute: string]: string;
}

export interface ComponentOptions {
  tag: string;
  template?: string;
  styles?: string;
  shadowDom?: boolean | ShadowRootInit;
  extensionOptions?: { extends: string };
  hostAttributes?: HostAttributes;
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

const lifeCycleHooks = ['onInit', 'onDestroy', 'onChanges', 'onBeforeCheck'];

export class CustomElement {
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

        const parentComponent = CustomElement.findParentComponent(this);
        const isAlreadyAttached = parentComponent === this.parentComponent;

        if (isAlreadyAttached) {
          return;
        }

        this.parentComponent = parentComponent;

        try {
          const injector = CustomElement.createComponentInjector(this, options);

          if (options.shadowDom === undefined) {
            options.shadowDom = injector.get(ShadowDomToggle).enabled;
          }

          CustomElement.insertTemplate(this, options);
          CustomElement.copyHostAttributes(this, options);
          CustomElement.setupChangeDetector(this);

          this.onInit();
        } catch (error) {
          console.log(error);
        }
      }

      disconnectedCallback() {
        this.onDestroy();
        Injector.getInjectorOf(this).get(ChangeDetectorRef).unregister();

        Object.values(this).filter((k) => k && typeof k === 'object' && k instanceof Subscription && k.unsubscribe());
      }
    };

    CustomElement.addLifeCycleHooks(customElement);

    return customElement;
  }

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
    const parentInjector =
      options.parentInjector || Injector.getInjectorOf(component.parentComponent) || Injector.global;
    const injector = new Injector(parentInjector);

    injector.provideAll(options.providers || []);

    if (!injector.canProvide(ChangeDetectorRef)) {
      injector.provide(ChangeDetectorRef, ReactiveChangeDetector);
    } else {
      const localChangeDetector = injector.get(ChangeDetectorRef).fork(component);
      injector.provide(ChangeDetectorRef, Value(localChangeDetector));
    }

    Injector.setInjectorOf(component, injector);

    return injector;
  }

  static setupChangeDetector(component: CustomHTMLElement) {
    const injector = Injector.getInjectorOf(component);
    const changeDetector = injector.get(ChangeDetectorRef);
    const executionContext = new ExecutionContext(component);
    const dom = injector.get(DomScanner);

    injector.provide(ExecutionContext, Value(executionContext));

    Array.from(component.shadowRoot?.children || component.children).forEach((node) =>
      dom.scanTree(node as HTMLElement, changeDetector, executionContext),
    );

    changeDetector.beforeCheck(() => component.onBeforeCheck());
    changeDetector.afterCheck((changes: Changes) => changes.size && component.onChanges(changes));
    changeDetector.markAsDirtyAndCheck();
  }

  static insertTemplate(component: CustomHTMLElement, options: ComponentOptions) {
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
      const currentContentNodes = Array.from(component.children);
      component.append(templateContent);
      const slot = component.querySelector('slot');
      currentContentNodes.forEach((node) => slot.append(node));
      return;
    }

    component.appendChild(templateContent);
  }

  static copyHostAttributes(component: CustomHTMLElement, options: ComponentOptions) {
    const { hostAttributes } = options;

    if (!hostAttributes) return;

    Object.keys(hostAttributes).forEach((attribute) => {
      component.setAttribute(attribute, hostAttributes[attribute]);
    });
  }
}
