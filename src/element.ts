import { ChangeDetectorSymbol, ChangeDetector, Expression } from './change-detection';
import { attachEvent } from './events';
import { AnyFunction } from './utils';

export function compileElement(elementOrShadowRoot: HTMLElement | DocumentFragment, root: HTMLElement) {
  if (elementOrShadowRoot.children.length) {
    Array.from(elementOrShadowRoot.children).forEach((e: HTMLElement) => compileElement(e, root));
  }

  // skip shadowRoot
  if ('getAttributeNames' in elementOrShadowRoot === false) return;

  const element = elementOrShadowRoot as HTMLElement;
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
        attachWatcher(cd, element, attribute.slice(1), value, true);
        break;

      default:
        setAttribute(element, attribute, value);
    }
  });
}

export function setAttribute(element: HTMLElement, attribute: string, value: string) {
  element.setAttribute(attribute, value);
}

function attachWatcher(
  changeDetector: ChangeDetector,
  element: HTMLElement,
  property: string,
  expression: string,
  isAttribute = false,
) {
  const transformedProperty = !isAttribute && findElementProperty(element, property);
  const expressionFn = Function('context', `return ${expression}`) as AnyFunction;

  changeDetector.watch(
    expressionFn,
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
