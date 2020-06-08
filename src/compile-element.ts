import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';
import { attachEvent } from './events';

export function compileElement(element: HTMLElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
  if (element.nodeType !== element.ELEMENT_NODE) return;

  element.getAttributeNames().forEach(attribute => {
    const value = element.getAttribute(attribute);
    const firstCharacter = attribute[0];
    const unwrappedAttribute = attribute.slice(1, -1);
    const unprefixedAttribute = attribute.slice(1);

    switch (firstCharacter) {
      case '(':
        const eventHandler = ($event: Event) => executionContext.run(value, { $event });
        attachEvent(changeDetector, element, unwrappedAttribute, eventHandler);
        break;

      case '[':
        watchProperty(changeDetector, executionContext, element, unwrappedAttribute, value);
        break;

      case '@':
        watchAttribute(changeDetector, executionContext, element, unprefixedAttribute, value);
        break;
    }
  });
}

export function watchProperty(
  changeDetector: ChangeDetector,
  executionContext: ExecutionContext,
  element: HTMLElement,
  property: string,
  expression: string
) {
  const transformedProperty = findElementProperty(element, property);
  const valueGetter = () => executionContext.run(expression);

  changeDetector.watch(valueGetter, (value: any) => element[transformedProperty] = value);
}

export function watchAttribute(
  changeDetector: ChangeDetector,
  executionContext: ExecutionContext,
  element: HTMLElement,
  property: string,
  expression: string,
) {
  const valueGetter = () => executionContext.run(expression);
  changeDetector.watch(valueGetter, (value: any) => element.setAttribute(property, value));
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
