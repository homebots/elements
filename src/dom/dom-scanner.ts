import { ChangeDetector, Changes } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { Injectable, Inject } from '@homebots/injector';
import { SyntaxRules } from '../syntax/syntax-rules';
import { TemplateProxy } from './template-proxy';
import { Dom } from './dom';

@Injectable()
export class DomScanner {
  @Inject() private syntaxRules: SyntaxRules;

  scanElement(element: HTMLElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    // TODO match {{  }}
    if (element.nodeType !== element.ELEMENT_NODE) {
      return;
    }

    if (Dom.isTemplateNode(element)) {
      const proxy = new TemplateProxy();
      changeDetector = changeDetector.fork(proxy);
      changeDetector.afterCheck((changes: Changes) => changes.size && proxy.onChanges(changes));
      (element as any).proxy = proxy;
    }

    element
      .getAttributeNames()
      .forEach((attribute) => this.syntaxRules.match(changeDetector, executionContext, element, attribute));
  }

  scanTree(
    elementOrShadowRoot: HTMLElement | DocumentFragment,
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
  ) {
    const nodeType = elementOrShadowRoot.nodeType;

    if (elementOrShadowRoot.children?.length) {
      Array.from(elementOrShadowRoot.children).forEach((e: HTMLElement) =>
        this.scanTree(e, changeDetector, executionContext),
      );
    }

    const isNotElementOrDocument =
      nodeType !== elementOrShadowRoot.ELEMENT_NODE && nodeType !== elementOrShadowRoot.DOCUMENT_FRAGMENT_NODE;
    const isShadowRoot = (elementOrShadowRoot as HTMLElement).getAttributeNames === undefined;
    const isInsideTemplate = Dom.isTemplateNode(elementOrShadowRoot.parentNode);

    if (isNotElementOrDocument || isShadowRoot || isInsideTemplate) {
      return;
    }

    this.scanElement(elementOrShadowRoot as HTMLElement, changeDetector, executionContext);
  }
}