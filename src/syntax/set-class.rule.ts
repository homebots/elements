import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';

@Injectable()
export class SetClassRule implements SyntaxRule {
  readonly knownProperties: Record<string, string> = {};

  match(attribute: string) {
    return attribute.startsWith('[class.');
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    property: string,
    expression: string,
  ) {
    // class.xyz => xyz
    const className = property.slice(6);

    changeDetector.watch({
      expression: () => executionContext.run(expression),
      callback: (value: boolean) => (value ? element.classList.add(className) : element.classList.remove(className)),
    });
  }

  protected findElementProperty(element: HTMLElement, attributeName: string): string {
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
