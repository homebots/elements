import { BOOTSTRAP } from './bootstrap';
import { ChangeDetector, ChangeDetectorRef, ChangeDetectorSymbol, ZoneChangeDetector } from './change-detection';
import { attachEvent } from './events';
import { ExecutionContext } from './execution-context';
import { getInjectorFrom, InjectionToken, Injector, InjectorSymbol, Provider } from './injector';
import { Changes, watchInputs as addInputWatchers } from './inputs';
import { AnyFunction, createTemplateFromHtml } from './utils';
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

export type TemplateRef = InjectionToken<HTMLTemplateElement>;
export const TemplateRef = Symbol('TemplateRef');

export function Component(options: ComponentOptions) {
  return function (ComponentClass: typeof HTMLElement) {
    class CustomElement extends ComponentClass {
      parentComponent: HTMLElement;

      onInit: LifecycleHook;
      onDestroy: LifecycleHook;
      onBeforeCheck: LifecycleHook;
      onChanges: OnChangesHook;

      connectedCallback() {
        try {
          const injector = createComponentInjector(this, options);
          const executionContext = new ExecutionContext(this);
          injector.register({ type: ExecutionContext, useValue: executionContext });

          attachShadowDom(this, options);
          addHostAttributes(this, options);
          compileElement(this.shadowRoot || this, this[ChangeDetectorSymbol], executionContext);
          addInputWatchers(this);

          this.onInit();
        } catch (error) {
          console.log(error);
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
  (component as any).parentComponent = parentComponent;

  return injector;
}

export function attachShadowDom(target: HTMLElement, options: ComponentOptions) {
  const { template } = options;
  const useShadowDom = template || options.useShadowDom || options.shadowDomOptions;

  if (useShadowDom) {
    const templateRef: HTMLTemplateElement = getInjectorFrom(target).get(TemplateRef);
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

export function compileElement(elementOrShadowRoot: HTMLElement | DocumentFragment, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
  if (elementOrShadowRoot.children.length) {
    Array.from(elementOrShadowRoot.children).forEach((e: HTMLElement) => compileElement(e, changeDetector, executionContext));
  }

  // skip if is a shadowRoot
  if ('getAttributeNames' in elementOrShadowRoot === false || elementOrShadowRoot.nodeName === 'TEMPLATE') return;

  const element = elementOrShadowRoot as HTMLElement;
  const attributes = element
    .getAttributeNames()
    .filter(attribute => {
      if (attribute[0] === '#') {
        executionContext.addLocals({ [attribute.slice(1)]: element });
        return false;
      }

      return true;
    });

  attributes.forEach(attribute => {
    const value = element.getAttribute(attribute);
    const firstCharacter = attribute[0];
    const unwrappedAttribute = attribute.slice(1, -1);

    switch (firstCharacter) {
      case '(':
        const eventHandler = ($event: Event) => executionContext.run(value, { $event });
        attachEvent(changeDetector, element, unwrappedAttribute, eventHandler);
        break;

      case '[':
        const valueGetter = () => executionContext.run(value);
        attachWatcher(changeDetector, element, unwrappedAttribute, valueGetter);
        break;

      case '@':
        const attributeGetter = () => executionContext.run(value);
        attachWatcher(changeDetector, element, attribute.slice(1), attributeGetter, true);
        break;

      default:
        setAttribute(element, attribute, value);
    }
  });
}

export function setAttribute(element: HTMLElement, attribute: string, value: string) {
  element.setAttribute(attribute, value);
}

export function attachWatcher(
  changeDetector: ChangeDetector,
  element: HTMLElement,
  property: string,
  getterFunction: AnyFunction,
  isAttribute = false,
) {
  const transformedProperty = !isAttribute && findElementProperty(element, property);

  changeDetector.watch(
    getterFunction,
    (value: any) => {
      if (isAttribute) {
        return setAttribute(element, property, value);
      }

      element[transformedProperty] = value;
    }
  );
}

const knownProperties: { [key: string]: string } = {};

export function findElementProperty(element: HTMLElement, attributeName: string): string {
  if (knownProperties[attributeName]) {
    return knownProperties[attributeName];
  }

  if (attributeName in element) {
    return attributeName;
  }

  for (const elementProperty in element) {
    if (elementProperty.toLowerCase() === attributeName) {
      knownProperties[attributeName] = elementProperty;
      return elementProperty;
    }
  }

  return attributeName;
}
