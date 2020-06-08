import { compileTemplate } from './compile-template';
import { compileElement } from './compile-element';
import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';

export function compileTree(elementOrShadowRoot: HTMLElement | DocumentFragment, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
  const nodeType = elementOrShadowRoot.nodeType;

  if (nodeType !== elementOrShadowRoot.ELEMENT_NODE && nodeType !== elementOrShadowRoot.DOCUMENT_FRAGMENT_NODE) return;

  if (elementOrShadowRoot.children.length) {
    Array.from(elementOrShadowRoot.children).forEach((e: HTMLElement) => compileTree(e, changeDetector, executionContext));
  }

  // skip if is a shadowRoot
  if ('getAttributeNames' in elementOrShadowRoot === false) return;

  // skip compilation of nodes inside templates
  if (elementOrShadowRoot.parentNode.nodeName === 'TEMPLATE') return;

  readReferences(elementOrShadowRoot as HTMLElement, executionContext);

  if (elementOrShadowRoot.nodeName === 'TEMPLATE') {
    compileTemplate(elementOrShadowRoot as HTMLTemplateElement, changeDetector, executionContext);
    return;
  }

  compileElement(elementOrShadowRoot as HTMLElement, changeDetector, executionContext);
}

export function readReferences(element: HTMLElement, executionContext: ExecutionContext) {
  element.getAttributeNames().forEach(attribute => {
    if (attribute[0] === '#') {
      executionContext.addLocals({ [attribute.slice(1)]: element });
    }
  });
}
