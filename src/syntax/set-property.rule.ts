import { Injectable } from '@homebots/injector';
import { getInputMetadata } from '../inputs';
import { isTemplateNode } from '../utils';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';
import { TemplateProxy } from './view-container.rule';

type SetPropertyCallback = (property: string, value: any) => void;
interface OnSetProperty {
  setProperty: SetPropertyCallback;
}

@Injectable()
export class SetPropertyRule implements SyntaxRule {
  readonly knownProperties: Record<string, string> = {};

  match(attribute: string) {
    return attribute.charAt(0) === '[' || attribute.charAt(0) === '*';
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement & OnSetProperty,
    property: string,
    expression: string,
  ) {
    const transformedProperty = this.findElementProperty(element, property);
    const isTemplate = isTemplateNode(element);
    const inputProperties = getInputMetadata(isTemplate ? (element as any).container : element);
    const inputOptions = inputProperties.find((p) => p.property === property);
    const useEquals = inputOptions?.options.useEquals;

    changeDetector.watch({
      expression: () => executionContext.run(expression),
      callback: (value: any) => this.setProperty(element, transformedProperty, value),
      property,
      useEquals,
      firstTime: true,
    });
  }

  setProperty(element: HTMLElement | TemplateProxy<any>, property: string, value: any) {
    if (TemplateProxy.isProxy(element)) {
      (element as TemplateProxy<any>).setProperty(property, value);
      return;
    }

    element[property] = value;
  }

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
}
