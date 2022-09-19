/// <reference types="reflect-metadata" />

import { Inject, Injectable, Injector } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';
import { ContainerRegistry } from '../containers/registry';
import { Dom } from '../dom/dom';
import { HTMLTemplateElementProxy } from '../dom/template-proxy';

@Injectable()
export class ViewContainerRule implements SyntaxRule {
  @Inject() containerRegistry: ContainerRegistry;

  match(attribute: string, element: HTMLElement) {
    return attribute.charAt(0) === '*' && Dom.isTemplateProxy(element);
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLTemplateElementProxy,
    containerName: string,
    _: string,
  ) {
    const containerHandler = this.createContainerByName(containerName, element, changeDetector, executionContext);
    element.proxy.setTarget(containerHandler);
  }

  createContainerByName(
    containerName: string,
    template: HTMLTemplateElement,
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
  ) {
    if (this.containerRegistry.has(containerName)) {
      const Class = this.containerRegistry.get(containerName);
      const container = new Class(template, changeDetector, executionContext);
      Injector.setInjectorOf(container, Injector.getInjectorOf(this));

      return container;
    }
  }
}
