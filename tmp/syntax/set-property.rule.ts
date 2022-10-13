import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { Dom } from '../dom/dom';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';

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

    changeDetector.watch({
      expression() {
        return executionContext.run(expression);
      },
      callback(value: any) {
        if (Dom.isTemplateNode(element) && element.proxy) {
          element.proxy[property] = value;
          return;
        }

        element[transformedProperty] = value;
      },
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
