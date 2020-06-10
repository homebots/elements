import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';
import { Injectable } from './injector';

interface SyntaxRule {
  (changeDetector: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, attribute: string, attributeValue: string): void;
}

export interface AttributeMatcher {
  (attribute: string, element: HTMLElement): boolean;
}

@Injectable({ providedBy: 'root' })
export class SyntaxRules {
  private rules: Array<{ matcher: AttributeMatcher, handler: SyntaxRule }> = [];

  addRule(matcher: AttributeMatcher, handler: SyntaxRule) {
    this.rules.push({ matcher, handler });
  }

  match(changeDetector: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, attribute: string) {
    const value = element.getAttribute(attribute);
    const sanitizedAttributeName = cleanAttributeName(attribute);

    this.rules.forEach((rule) => {
      if (rule.matcher(attribute, element)) {
        element.removeAttribute(attribute);
        rule.handler(changeDetector, executionContext, element, sanitizedAttributeName, value);
      }
    });
  }
}

const cleanAttributeRe = /^[^a-z]|[^a-z]$/g

export function cleanAttributeName(attribute: string) {
  return attribute.replace(cleanAttributeRe, '');
}
