import { Subscription } from 'rxjs';
import { BOOTSTRAP } from './bootstrap';
import { ChangeDetectorRef } from './change-detection';
import { compileTree } from './compile-tree';
import { ExecutionContext } from './execution-context';
import { getInjectorFrom, InjectionToken, Injector, InjectorSymbol, Provider } from './injector';
import { addInputWatchers, Changes } from './inputs';
import { createTemplateFromHtml, noop } from './utils';


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
  useShadowDom?: boolean;
  extensionOptions?: { extends: string; };
  shadowDomOptions?: ShadowRootInit;
  hostAttributes?: HostAttributes;
  providers?: Provider[];
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
        injector.register({ type: ExecutionContext, useValue: executionContext });

        attachShadowDom(this, options);
        addHostAttributes(this, options);
        compileTree(this.shadowRoot || this, changeDetector, executionContext);
        addInputWatchers(this, changeDetector);

        changeDetector.scheduleCheck();
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
  const parentChangeDetector = parentInjector?.get(ChangeDetectorRef) || null;
  const injector = new Injector(parentInjector, options.providers);

  let template = options.template || '';
  if (options.styles) {
    template += `<style>${options.styles}</style>`;
  }

  const templateRef = createTemplateFromHtml(template);
  const changeDetector = parentChangeDetector?.fork(component);

  injector.register({ type: TemplateRef, useValue: templateRef });
  injector.register({ type: ChangeDetectorRef, useValue: changeDetector });

  component[InjectorSymbol] = injector;

  return injector;
}

export function attachShadowDom(target: CustomElement, options: ComponentOptions) {
  const useShadowDom = Boolean(options.template || options.useShadowDom || options.shadowDomOptions);

  if (useShadowDom) {
    const templateRef: HTMLTemplateElement = getInjectorFrom(target).get(TemplateRef);
    const shadowRoot = target.attachShadow(options.shadowDomOptions || { mode: 'open' });

    shadowRoot.appendChild(templateRef.content.cloneNode(true));
  }
}

export function addHostAttributes(target: CustomElement, options: ComponentOptions) {
  const { hostAttributes } = options;

  if (!hostAttributes) return;

  Object.keys(hostAttributes).forEach(attribute => {
    target.setAttribute(attribute, hostAttributes[attribute]);
  });
}
