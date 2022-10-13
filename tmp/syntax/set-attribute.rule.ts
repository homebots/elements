import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';

@Injectable()
export class SetAttributeRule implements SyntaxRule {
  match(attribute: string) {
    return attribute.charAt(0) === '@';
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    property: string,
    expression: string,
  ) {
    changeDetector.watch({
      expression: () => executionContext.run(expression),
      callback: (value: any) => element.setAttribute(property, value),
    });
  }
}
