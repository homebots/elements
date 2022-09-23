import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';

export interface SyntaxRule {
  match(attribute: string, element: HTMLElement): boolean;
  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    attribute: string,
    attributeValue: string,
  ): void;
}

@Injectable()
export class SyntaxRules {
  protected rules: Array<SyntaxRule> = [];
  protected cleanAttributeRe = /^[^a-z]|[^a-z]$/g;

  addRule(rule: SyntaxRule) {
    this.rules.push(rule);
  }

  match(changeDetector: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, attribute: string) {
    const value = String(element.getAttribute(attribute)).trim();
    const sanitizedAttributeName = this.cleanAttributeName(attribute);

    this.rules.forEach((rule) => {
      if (rule.match(attribute, element)) {
        element.removeAttribute(attribute);
        rule.apply(changeDetector, executionContext, element, sanitizedAttributeName, value);
      }
    });
  }

  protected cleanAttributeName(attribute: string) {
    return attribute.replace(this.cleanAttributeRe, '');
  }
}

