import { Injectable } from '@homebots/injector';
import { getInputMetadata } from '../inputs';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';
import { Dom } from '../dom/dom';
import { CustomElement } from '../custom-element';

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
    const inputProperties = Dom.isTemplateNode(element) ? [] : getInputMetadata(element);
    const inputOptions = inputProperties.find((p) => p.property === property);
    const useEquals = !!inputOptions?.options.useEquals;

    changeDetector.watch({
      expression: () => executionContext.run(expression),
      callback: (value: any) => {
        Dom.setProperty(element, transformedProperty, value);

        if (CustomElement.isCustomElement(element)) {
          ChangeDetector.getDetectorOf(element).detectChanges();
        }
      },
      property,
      useEquals,
      firstTime: true,
    });
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
