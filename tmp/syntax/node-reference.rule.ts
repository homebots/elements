import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';

@Injectable()
export class NodeReferenceRule implements SyntaxRule {
  match(attribute: string) {
    return attribute.charAt(0) === '#';
  }

  apply(_: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, attribute: string) {
    executionContext.addLocals({ [attribute]: element });
  }
}
