import { ChangeDetector, Changes } from './change-detection';
import { ExecutionContext } from './execution-context';
import { Injectable, Injector, Inject } from './injector';
import { SyntaxRules } from './syntax-rules';
import { ContainerRegistry } from './containers/registry';
import { getInputMetadata } from './inputs';
import { OnChanges } from './component';

export type ContainerTarget = object & OnChanges;

export class TemplateContainer {
  target: ContainerTarget;

  onChanges(changes: Changes) {
    if (this.target) {
      this.target.onChanges(changes);
    }
  }

  setProperty(property: string, value: any): void {
    if (this.target) {
      this.target[property] = value;
    }
  }
}

type HTMLElementWitContainer<T extends HTMLElement> = T & { container: TemplateContainer };
const TEMPLATE_NODE = 'TEMPLATE';

@Injectable()
export class DomHelpers {
  @Inject() private injector: Injector;
  @Inject() syntaxRules: SyntaxRules;
  @Inject() containerRegistry: ContainerRegistry;

  watchExpressionAndUpdateProperty(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElementWitContainer<HTMLElement>,
    property: string,
    expression: string
  ) {
    const isTemplate = element.nodeName === TEMPLATE_NODE;
    const transformedProperty = this.findElementProperty(element, property);
    const inputProperties = getInputMetadata(isTemplate ? element.container.target : element);
    const isInput = inputProperties.filter(i => i.property === transformedProperty).length > 0;
    const valueGetter = () => executionContext.run(expression);

    changeDetector.watch({
      expression: valueGetter,
      callback: (value: any) => {
        if (isTemplate) {
          element.container.setProperty(transformedProperty, value);
          return;
        }

        element[transformedProperty] = value;
      },

      metadata: { property, isInput, firstTime: true },
    });
  }

  watchExpressionAndSetAttribute(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    property: string,
    expression: string,
  ) {
    const valueGetter = () => executionContext.run(expression);
    changeDetector.watch({
      expression: valueGetter,
      callback: (value: any) => element.setAttribute(property, value),
    });
  }

  watchExpressionAndChangeClassName(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    property: string,
    expression: string,
  ) {
    const valueGetter = () => executionContext.run(expression);
    const className = property.slice(6);

    changeDetector.watch(valueGetter, (value: boolean) => value ?
      element.classList.add(className) :
      element.classList.remove(className)
    );
  }

  addEventListener(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    eventNameAndSuffix: string,
    expression: string
  ) {
    const eventHandler = ($event: Event) => executionContext.run(expression, { $event });
    const [eventName, suffix] = eventNameAndSuffix.split('.');
    const useCapture = eventName === 'focus' || eventName === 'blur';
    const callback = (event: Event) => {
      if (suffix === 'once') {
        element.removeEventListener(eventName, callback, { capture: useCapture });
      }

      if (suffix === 'stop') {
        event.preventDefault();
        event.stopPropagation();
      }

      eventHandler.apply(element, [event]);
      changeDetector.markAsDirtyAndCheck();
    };

    element.addEventListener(eventName, callback, { capture: useCapture });
  }


  readReferences(
    _: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    attribute: string,
    __: string,
  ) {
    executionContext.addLocals({ [attribute]: element });
  }

  createTemplateContainerTarget(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElementWitContainer<HTMLTemplateElement>,
    containerName: string,
    _: string,
  ) {
    element.container.target = this.createContainerByName(containerName, element, changeDetector, executionContext);
  }

  knownProperties: { [key: string]: string } = {};

  findElementProperty(element: HTMLElement, attributeName: string): string {
    if (this.knownProperties[attributeName]) {
      return this.knownProperties[attributeName];
    }

    if (attributeName in element) {
      return attributeName;
    }

    for (const elementProperty in element) {
      if (elementProperty.toLowerCase() === attributeName) {
        this.knownProperties[attributeName] = elementProperty;
        return elementProperty;
      }
    }

    return attributeName;
  }

  createContainerByName(containerName: string, template: HTMLTemplateElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (this.containerRegistry.has(containerName)) {
      return this.injector.create(this.containerRegistry.get(containerName), template, changeDetector, executionContext) as OnChanges;
    }
  }

  compileElement(element: HTMLElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (element.nodeType !== element.ELEMENT_NODE) return;

    if (element.nodeName === TEMPLATE_NODE) {
      const container = (element as any).container = new TemplateContainer();
      changeDetector = changeDetector.fork(container);
      changeDetector.afterCheck(changes => changes && container.onChanges(changes));
    }

    element.getAttributeNames().forEach(attribute => this.syntaxRules.match(changeDetector, executionContext, element, attribute));
  }

  compileTree(
    elementOrShadowRoot: HTMLElement | DocumentFragment,
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
  ) {
    const nodeType = elementOrShadowRoot.nodeType;

    if (elementOrShadowRoot.children?.length) {
      Array.from(elementOrShadowRoot.children).forEach((e: HTMLElement) => this.compileTree(e, changeDetector, executionContext));
    }

    const isNotElementOrDocument = nodeType !== elementOrShadowRoot.ELEMENT_NODE && nodeType !== elementOrShadowRoot.DOCUMENT_FRAGMENT_NODE;
    const isShadowRoot = (elementOrShadowRoot as HTMLElement).getAttributeNames === undefined;
    const isInsideTemplate = elementOrShadowRoot.parentNode?.nodeName === TEMPLATE_NODE;

    if (isNotElementOrDocument || isShadowRoot || isInsideTemplate) return;

    this.compileElement(elementOrShadowRoot as HTMLElement, changeDetector, executionContext);
  }
}

export function Child(selector: string, isStatic?: boolean) {
  return (target: any, property: string) => {
    let node: HTMLElement;

    Object.defineProperty(target, property, {
      get() {
        if (isStatic && node) return node;
        return node = (this.shadowRoot || this).querySelector(selector);
      }
    })
  }
}

export function Children(selector: string) {
  return (target: any, property: string) => {
    Object.defineProperty(target, property, {
      get() {
        return (this.shadowRoot || this).querySelectorAll(selector);
      }
    })
  }
}
