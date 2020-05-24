import { BOOTSTRAP } from './bootstrap';
import { ChangeDetector, ChangeDetectorSymbol } from './change-detection';
import { InjectionToken, Injector, InjectorSymbol, Provider } from './injector';
import { ZoneRef, ZoneSymbol } from './zone';

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

export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime: boolean;
}

export interface Changes {
  [property: string]: Change<unknown>;
}

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

export interface InputOptions {
  useEquals: boolean;
}

interface InputWatcher {
  property: string;
  options?: InputOptions;
}

const INPUTS_META = 'inputs';

export function Input(options?: InputOptions) {
  return (target: any, property: string) => {
    const inputs: InputWatcher[] = Reflect.getMetadata(INPUTS_META, target) || [];
    inputs.push({
      property,
      options,
    });

    Reflect.defineMetadata(INPUTS_META, inputs, target);
  };
}

export interface CustomElementClass extends OnInit, OnDestroy, OnChanges, Partial<HTMLElement> {
  [ChangeDetectorSymbol]?: ChangeDetector;
  [InjectorSymbol]?: Injector;
  [ZoneSymbol]?: Zone;
}

export const TemplateRef: InjectionToken<HTMLTemplateElement> = Symbol('TemplateRef');

export function Component(options: ComponentOptions) {
  return function (ComponentClass: typeof HTMLElement) {
    class CustomElement extends ComponentClass implements CustomElementClass {
      property = true;
      onInit: LifecycleHook;
      onDestroy: LifecycleHook;
      onBeforeCheck: LifecycleHook;
      onChanges: OnChangesHook;

      connectedCallback() {
        attachMetadata(this, options);

        const template = options.template;
        const hasShadowDom = template && (template.includes('<slot') || options.useShadowDom || options.shadowDomOptions);
        const injector = this[InjectorSymbol];

        if (hasShadowDom) {
          injector.register({
            type: TemplateRef,
            useValue: attachShadowDom(this, options),
          });
        } else if (template) {
          this.innerHTML = template;
          injector.register({
            type: TemplateRef,
            useValue: this,
          });
        }

        addHostAttributes(this, options.hostAttributes);

        if (hasShadowDom) {
          compileShadowDom(this.shadowRoot, this);
        } else {
          compileElement(this, this);
        }

        watchInputs(this);
        this[ChangeDetectorSymbol].beforeCheck = this.onBeforeCheck;
        this.onInit();
      }

      disconnectedCallback() {
        this[ChangeDetectorSymbol].unregister();
        this.onDestroy();
      }
    }


    Object.defineProperty(CustomElement, '__component__', options);
    addLifeCycleHooks(CustomElement);

    BOOTSTRAP.whenStable(() => customElements.define(options.tag, CustomElement, options.extensionOptions));
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

function watchInputs(customElement: HTMLElement & OnChanges) {
  const inputs: InputWatcher[] = Reflect.getMetadata(INPUTS_META, customElement) || [];

  if (!inputs.length) return;

  let changes: Changes = {};
  let firstTime = true;
  let hasChanges = false;

  const changeDetector: ChangeDetector = customElement[ChangeDetectorSymbol];
  inputs.forEach(input => {
    changeDetector.add({
      ...input.options,
      name: input.property,
      expression: () => customElement[input.property],
      callback: (value, lastValue) => {
        hasChanges = true;
        changes[input.property] = {
          value,
          lastValue,
          firstTime,
        };
      },
    });
  });

  changeDetector.afterCheck = () => {
    if (!hasChanges) return;

    customElement.onChanges(changes);
    firstTime = false;
    changes = {};
    hasChanges = false;
  };
}

function attachMetadata(component: HTMLElement, options: ComponentOptions) {
  let parentComponent: any = component;
  const customElement = component as unknown as CustomElementClass;

  // tslint:disable-next-line: no-conditional-assignment
  while (parentComponent && (parentComponent = (parentComponent.parentNode || parentComponent.host))) {
    if (parentComponent[ChangeDetectorSymbol]) {
      const injector = new Injector(parentComponent[InjectorSymbol], options.providers);
      const changeDetector = new ChangeDetector(component, parentComponent[ChangeDetectorSymbol], injector);
      const zone = Zone.current.fork(changeDetector);

      injector.register({
        type: ZoneRef,
        useValue: zone,
      });

      injector.register({
        type: ChangeDetector,
        useValue: changeDetector,
      });

      customElement[InjectorSymbol] = injector;
      customElement[ChangeDetectorSymbol] = changeDetector;
      customElement[ZoneSymbol] = zone;
      return;
    }
  }
}

function attachShadowDom(target: HTMLElement, options: ComponentOptions) {
  const templateRef = document.createElement('template');
  const shadowRoot = target.attachShadow(options.shadowDomOptions || { mode: 'open' });

  templateRef.innerHTML = options.template;
  shadowRoot.appendChild(templateRef.content.cloneNode(true));

  return templateRef;
}

function addHostAttributes(target: HTMLElement, attributes: HostAttributes) {
  if (!attributes) return;

  Object.keys(attributes).forEach(attribute => {
    target.setAttribute(attribute, attributes[attribute]);
  });
}

function compileShadowDom(shadowRoot: DocumentFragment, root: HTMLElement) {
  if (shadowRoot.children.length) {
    Array.from(shadowRoot.children).forEach((element: HTMLElement) => compileElement(element, root));
  }
}

function compileElement(element: HTMLElement, root: HTMLElement) {
  if (element.children.length) {
    Array.from(element.children).forEach((e: HTMLElement) => compileElement(e, root));
  }

  const attributes = element.getAttributeNames();
  const cd = root[ChangeDetectorSymbol];

  attributes.forEach(attribute => {
    const value = element.getAttribute(attribute);
    const firstCharacter = attribute[0];
    const realAttribute = attribute.slice(1, -1);

    switch (firstCharacter) {
      case '(':
        const fn = Function('$event', value).bind(root);
        attachEvent(cd, element, realAttribute, fn);
        break;

      case '[':
        attachWatcher(cd, element, realAttribute, value);
        break;

      case '@':
        attachWatcher(cd, element, realAttribute, value, true);
        break;

      default:
        setAttribute(element, attribute, value);
    }
  });
}

function setAttribute(element: HTMLElement, attribute: string, value: string) {
  element.setAttribute(attribute, value);
}

function attachEvent(cd: ChangeDetector, element: HTMLElement, eventName: string, expression: VoidFunction) {
  const useCapture = eventName === 'focus' || eventName === 'blur';
  const fn = (event: Event) => cd.run(() => {
    cd.markForCheck();
    expression.apply(element, [event]);
  });

  element.addEventListener(eventName, fn, { capture: useCapture });
}

function attachWatcher(
  cd: ChangeDetector,
  element: HTMLElement,
  property: string,
  expression: string,
  isAttribute = false,
) {
  const transformedProperty = !isAttribute && findElementProperty(element, property);

  cd.add({
    expression: expression as any,
    callback: (value: any) => {
      if (isAttribute) {
        return setAttribute(element, property, value);
      }

      element[transformedProperty] = value;
    },
  });
}

const knownProperties: { [key: string]: string } = {};

function findElementProperty(element: HTMLElement, attributeName: string): string {
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
