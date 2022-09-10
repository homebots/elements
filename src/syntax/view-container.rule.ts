/// <reference types="reflect-metadata" />

import { Inject, Injectable } from '@homebots/injector';
import { ChangeDetector, Changes, OnChanges } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';
import { ContainerRegistry } from '../containers/registry';
import { isTemplateNode } from '../utils';

export const proxySymbol = Symbol('proxy');

export class TemplateProxy<T extends OnChanges> implements OnChanges {
  private target: T;
  private queue = [];
  [proxySymbol] = true;

  static isProxy(target: any) {
    return target[proxySymbol] === true;
  }

  getMetadata(name: any) {
    if (this.target) {
      return Reflect.getMetadata(name, this.target);
    }

    return null;
  }

  onChanges(changes: Changes) {
    if (this.target) {
      this.target.onChanges(changes);
      return;
    }

    this.queue.push(() => this.onChanges(changes));
  }

  setProperty(property: string, value: any): void {
    if (this.target) {
      this.target[property] = value;
      return;
    }

    this.queue.push(() => this.setProperty(property, value));
  }

  setTarget(target: T): void {
    this.target = target;
    this.flush();
  }

  private flush() {
    this.queue.forEach((fn) => fn());
    this.queue.length = 0;
  }
}

type HTMLElementWitContainer<T extends HTMLElement> = T & { container: TemplateProxy<any> };

@Injectable()
export class ViewContainerRule implements SyntaxRule {
  @Inject() containerRegistry: ContainerRegistry;

  match(attribute: string, element: HTMLElement) {
    return attribute.charAt(0) === '*' && isTemplateNode(element);
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElementWitContainer<HTMLTemplateElement>,
    containerName: string,
    _: string,
  ) {
    const target = this.createContainerByName(containerName, element, changeDetector, executionContext);
    element.container.setTarget(target);
  }

  createContainerByName(
    containerName: string,
    template: HTMLTemplateElement,
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
  ) {
    if (this.containerRegistry.has(containerName)) {
      const Class = this.containerRegistry.get(containerName);
      return new Class(template, changeDetector, executionContext) as HTMLElement;
    }
  }
}
