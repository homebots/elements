import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';
import { Injectable, Injector, Inject } from './injector';
import { SyntaxRules } from './syntax-rules';
import { ContainerRegistry } from './containers/registry';
import { addInputWatchers } from './inputs';

type HTMLElementWitContainer<T extends HTMLElement> = T & { container: object };

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
    const transformedProperty = this.findElementProperty(element, property);
    const valueGetter = () => executionContext.run(expression);
    const isTemplate = element.nodeName === 'TEMPLATE';

    changeDetector.watch({
      expression: valueGetter,
      callback: (value: any) => (isTemplate && element.container || element)[transformedProperty] = value,
      name: property,
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
      name: property
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

  readReferences(
    _: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    attribute: string,
    __: string,
  ) {
    executionContext.addLocals({ [attribute]: element });
  }

  createContainerForTemplate(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElementWitContainer<HTMLTemplateElement>,
    property: string,
    _: string,
  ) {
    const container = (element as any).container = this.createContainerByName(property, element, changeDetector, executionContext);
    addInputWatchers(container as any, changeDetector);
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
      return this.injector.create(this.containerRegistry.get(containerName), template, changeDetector, executionContext);
    }
  }

  compileElement(element: HTMLElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (element.nodeType !== element.ELEMENT_NODE) return;

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
    const isInsideTemplate = elementOrShadowRoot.parentNode?.nodeName === 'TEMPLATE';

    if (isNotElementOrDocument || isShadowRoot || isInsideTemplate) return;

    this.compileElement(elementOrShadowRoot as HTMLElement, changeDetector, executionContext);
  }

}
