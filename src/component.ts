import { BOOTSTRAP } from './bootstrap';
import { ChangeDetectorRef, ChangeDetectorSymbol, ZoneChangeDetector, Expression } from './change-detection';
import { compileElement } from './element';
import { InjectionToken, Injector, InjectorSymbol, Provider, getInjectorFrom } from './injector';
import { Changes, watchInputs as addInputWatchers } from './inputs';
import { createTemplateFromHtml } from './utils';
import { ZoneRef } from './zone';

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
    class CustomElement extends ComponentClass {
      onInit: LifecycleHook;
      onDestroy: LifecycleHook;
      onBeforeCheck: LifecycleHook;
      onChanges: OnChangesHook;

      connectedCallback() {
        try {
          createComponentInjector(this, options);
          attachShadowDom(this, options);
          addHostAttributes(this, options);
          compileElement(this.shadowRoot || this, this);
          addInputWatchers(this);

          this.onInit();
        } catch (error) {
          console.log(error);
          throw error;
        }
      }

      disconnectedCallback() {
        this[ChangeDetectorSymbol].unregister();
        this.onDestroy();
      }
    }

    addLifeCycleHooks(CustomElement);

    BOOTSTRAP.whenReady(() => customElements.define(options.tag, CustomElement, options.extensionOptions));
  };
}

const noop = () => { };
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

export function createComponentInjector(component: HTMLElement, options: ComponentOptions) {
  const parentComponent = findParentComponent(component);
  const parentInjector = parentComponent ? parentComponent[InjectorSymbol] : null;
  const parentChangeDetector = parentInjector?.get(ChangeDetectorRef) || null;
  const parentZone = (parentInjector?.get(ZoneRef) || Zone.root);
  const injector = new Injector(parentInjector, options.providers);
  const changeDetector = new ZoneChangeDetector(component, parentChangeDetector, injector);
  const zone = parentZone.fork(changeDetector);
  const template = createTemplateFromHtml(options.template || '');

  injector.register({ type: TemplateRef, useValue: template });
  injector.register({ type: ZoneRef, useValue: zone });
  injector.register({ type: ChangeDetectorRef, useValue: changeDetector });

  component[ChangeDetectorSymbol] = changeDetector;
  component[InjectorSymbol] = injector;
}

export function attachShadowDom(target: HTMLElement, options: ComponentOptions) {
  const { template } = options;
  const useShadowDom = template || options.useShadowDom || options.shadowDomOptions;

  if (useShadowDom) {
    const templateRef = getInjectorFrom(target).get(TemplateRef);
    const shadowRoot = target.attachShadow(options.shadowDomOptions || { mode: 'open' });

    shadowRoot.appendChild(templateRef.content.cloneNode(true));
  }
}

export function addHostAttributes(target: HTMLElement, options: ComponentOptions) {
  const { hostAttributes } = options;

  if (!hostAttributes) return;

  Object.keys(hostAttributes).forEach(attribute => {
    target.setAttribute(attribute, hostAttributes[attribute]);
  });
}
