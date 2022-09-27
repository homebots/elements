import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { Injectable, Inject } from '@homebots/injector';
import { SyntaxRules } from '../syntax/syntax-rules';
import { Dom } from './dom';

export type HTMLAnchoredTemplateElement = HTMLTemplateElement & { anchor: Comment };

@Injectable()
export class DomScanner {
  @Inject() private syntaxRules: SyntaxRules;

  scanTextNode(node: Text, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (node.textContent.indexOf('{{') === -1) {
      return;
    }

    const expression = Dom.createTextPlaceholders(node.textContent.trim());
    changeDetector.watch({
      expression: () => executionContext.run(expression),
      callback: (value: string) => (node.textContent = value),
    });
  }

  scanElement(element: Node, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (Dom.isTextNode(element)) {
      this.scanTextNode(element, changeDetector, executionContext);
      return;
    }

    if (!Dom.isElementNode(element)) {
      return;
    }

    const isShadowRoot = (element as HTMLElement).getAttributeNames === undefined;
    const isInsideTemplate = Dom.isTemplateNode(element.parentNode);
    const isSlotInComponentWithoutShadowDom = element.nodeName === 'SLOT';

    if (isShadowRoot || isInsideTemplate || isSlotInComponentWithoutShadowDom) {
      return;
    }

    if (Dom.isTemplateNode(element)) {
      const proxy = Dom.attachProxy(element);
      changeDetector = changeDetector.fork();
      changeDetector.afterCheck((changes) => proxy.onChanges(changes));
      const anchor = document.createComment('');
      (element as HTMLAnchoredTemplateElement).anchor = anchor;
      element.parentNode.insertBefore(anchor, element);
      element.remove();
    }

    this.scanAttributes(element, changeDetector, executionContext);
  }

  scanAttributes(element: HTMLElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    element
      .getAttributeNames()
      .forEach((attribute) => this.syntaxRules.match(changeDetector, executionContext, element, attribute));
  }

  scanTree(element: Node, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (element.childNodes?.length) {
      const children = Array.from(element.childNodes);
      for (const child of children) {
        this.scanTree(child, changeDetector, executionContext);
      }
    }

    this.scanElement(element, changeDetector, executionContext);
  }
}
