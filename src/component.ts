import { Subscription } from 'rxjs';
import { BOOTSTRAP } from './bootstrap';
import { ChangeDetectorRef, Changes, ReactiveChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';
import { getInjectorFrom, InjectionToken, Injector, InjectorSymbol, Provider, Providers } from './injector';
import { createTemplateFromHtml, noop } from './utils';
import { DomHelpers } from './dom-helpers';

export interface ShadowRootInit {
  mode: 'open' | 'closed';
  delegateFocus: boolean;
}

export interface HostAttributes {
  [attribute: string]: string;
}

export interface ComponentOptions {
  tag: string;
  template?: string;
  styles?: string;
  shadowDom?: boolean | ShadowRootInit;
  extensionOptions?: { extends: string; };
  hostAttributes?: HostAttributes;
  providers?: Providers;
}

export type LifecycleHook = () => void;
export type OnChangesHook = (changes: Changes) => void;

export interface OnInit {
  onInit: LifecycleHook;
}

export interface OnDestroy {
  onDestroy: LifecycleHook;
}

export interface OnChanges {
  onChanges: OnChangesHook;
}

export interface OnBeforeCheck {
  onBeforeCheck: LifecycleHook;
}

export const TemplateRef: InjectionToken<HTMLTemplateElement> = Symbol('TemplateRef');

export function Component(options: ComponentOptions) {
  return function (ComponentClass: typeof HTMLElement) {
    const CustomElement = createComponentClass(ComponentClass, options);
    addLifeCycleHooks(CustomElement);
    BOOTSTRAP.whenReady(() => customElements.define(options.tag, CustomElement, options.extensionOptions));
  }
}

export interface CustomElement extends HTMLElement {
  parentComponent: HTMLElement;

  onInit: LifecycleHook;
  onDestroy: LifecycleHook;
  onBeforeCheck: LifecycleHook;
  onChanges: OnChangesHook;
}

export function createComponentClass(ComponentClass: typeof HTMLElement, options: ComponentOptions) {
  return class extends ComponentClass implements CustomElement {
    parentComponent: HTMLElement;

    onInit: LifecycleHook;
    onDestroy: LifecycleHook;
    onBeforeCheck: LifecycleHook;
    onChanges: OnChangesHook;

    connectedCallback() {
      this.parentComponent = findParentComponent(this);

      try {
        const injector = createComponentInjector(this, options);
        const changeDetector = injector.get(ChangeDetectorRef);
        const executionContext = new ExecutionContext(this);
        const dom = injector.get(DomHelpers);

        injector.register({ type: ExecutionContext, useValue: executionContext });

        addTemplate(this, options);
        addHostAttributes(this, options);
        dom.compileTree(this.shadowRoot || this, changeDetector, executionContext);

        changeDetector.beforeCheck(() => this.onBeforeCheck());
        changeDetector.afterCheck(changes => changes && this.onChanges(changes));
        changeDetector.markAsDirtyAndCheck();

        this.onInit();
      } catch (error) {
        console.log(error);
      }
    }

    disconnectedCallback() {
      this.onDestroy();
      getInjectorFrom(this).get(ChangeDetectorRef).unregister();
      Object.values(this).filter(k => k && typeof k === 'object' && k instanceof Subscription && k.unsubscribe());
    }
  }
};

const lifeCycleHooks = ['onInit', 'onDestroy', 'onChanges', 'onBeforeCheck'];

function addLifeCycleHooks(target: any) {
  lifeCycleHooks.forEach(hook => {
    if (!target.prototype[hook]) {
      target.prototype[hook] = noop;
    }
  });
}

export function findParentComponent(component: HTMLElement): HTMLElement | null {
  let parentComponent: any = component;

  while (parentComponent && (parentComponent = (parentComponent.parentNode || parentComponent.host))) {
    if (parentComponent[InjectorSymbol]) {
      return parentComponent;
    }
  }

  return null;
}

export function createComponentInjector(component: CustomElement, options: ComponentOptions) {
  const parentComponent = component.parentComponent;
  const parentInjector: Injector | null = parentComponent ? parentComponent[InjectorSymbol] : null;
  const injector = new Injector(parentInjector, options.providers);

  if (!injector.has(ChangeDetectorRef, false)) {
    const parentChangeDetector = parentInjector?.get(ChangeDetectorRef) || null;

    if (parentChangeDetector) {
      const changeDetector = parentChangeDetector?.fork(component);
      injector.register({ type: ChangeDetectorRef, useValue: changeDetector });
    } else {
      injector.register({ type: ChangeDetectorRef, useClass: ReactiveChangeDetector });
    }
  }

  component[InjectorSymbol] = injector;

  return injector;
}

export function addTemplate(target: CustomElement, options: ComponentOptions) {
  const useShadowDom = options.shadowDom !== false;

  let template = options.template || '';
  if (options.styles) {
    template += `<style>${options.styles}</style>`;
  }

  const templateRef = createTemplateFromHtml(template);
  getInjectorFrom(target).register({ type: TemplateRef, useValue: templateRef });

  if (useShadowDom) {
    const shadowDomOptions = options.shadowDom !== true && options.shadowDom || { mode: 'open' };
    const shadowRoot = target.attachShadow(shadowDomOptions);
    shadowRoot.appendChild(templateRef.content.cloneNode(true));
    return;
  }

  const content = templateRef.content.cloneNode(true);
  const hasSlot = template.indexOf('<slot') !== -1;

  if (hasSlot) {
    const currentContent = document.createDocumentFragment();
    target.childNodes.forEach(node => currentContent.appendChild(node));
    target.appendChild(content);
    (target.querySelector('slot') || target).appendChild(currentContent);
    return;
  }

  target.appendChild(content);
}

export function addHostAttributes(target: CustomElement, options: ComponentOptions) {
  const { hostAttributes } = options;

  if (!hostAttributes) return;

  Object.keys(hostAttributes).forEach(attribute => {
    target.setAttribute(attribute, hostAttributes[attribute]);
  });
}
