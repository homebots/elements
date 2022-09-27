import { Inject, Injectable, Injector } from '@homebots/injector';
import { getInputMetadata } from 'src/inputs';
import { ChangeDetector } from '../change-detection/change-detection';
import { Changes } from '../change-detection/observer';
import { ContainerRegistry } from '../containers/registry';
import { ExecutionContext } from '../execution-context';
import { SyntaxRules } from '../syntax/syntax-rules';
import { Dom } from './dom';

@Injectable()
export class DomScanner {
  @Inject() private syntaxRules: SyntaxRules;
  @Inject() private containerRegistry: ContainerRegistry;

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
      this.scanTemplate(element as any, changeDetector, executionContext);
    }

    this.scanAttributes(element as HTMLElement, changeDetector, executionContext);
  }

  scanTemplate(template: HTMLTemplateElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
    const containerName =
      template.getAttributeNames().find((value) => value.startsWith('*'))?.slice(1) || template.getAttribute('container');

    if (!containerName || !this.containerRegistry.has(containerName)) {
      return template;
    }

    changeDetector = changeDetector.fork();

    const Class = this.containerRegistry.get(containerName);
    const container = new Class(template, changeDetector, executionContext);
    const inputs = getInputMetadata(container);
    Injector.setInjectorOf(container, Injector.getInjectorOf(this));

    (template as any).proxy = container;

    Dom.watchInputChanges(container, changeDetector, inputs);
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
