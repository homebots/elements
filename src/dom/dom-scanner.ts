import { ChangeDetector, Changes } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { Injectable, Inject } from '@homebots/injector';
import { SyntaxRules } from '../syntax/syntax-rules';
import { HTMLTemplateElementProxy, TemplateProxy } from './template-proxy';
import { Dom } from './dom';

@Injectable()
export class DomScanner {
  @Inject() private syntaxRules: SyntaxRules;

  scanElement(element: Node, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    if (Dom.isTextNode(element)) {
      const { textContent } = element;

      const nodes = Dom.createTextPlaceholders(textContent);
      element.replaceWith(nodes);
      return;
    }

    // const isNotElementOrDocument =
    //   !Dom.isElementNode(element) && !Dom.isDocumentFragment(element);

    if (!Dom.isElementNode(element)) {
      return;
    }

    const isShadowRoot = (element as HTMLElement).getAttributeNames === undefined;
    const isInsideTemplate = Dom.isTemplateNode(element.parentNode);

    if (isShadowRoot || isInsideTemplate) {
      return;
    }

    if (Dom.isTemplateNode(element)) {
      const proxy = new TemplateProxy();
      changeDetector = changeDetector.fork(proxy);
      changeDetector.afterCheck((changes: Changes) => changes.size && proxy.onChanges(changes));
      (element as HTMLTemplateElementProxy).proxy = proxy;
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
