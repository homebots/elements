import { Injectable } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { SyntaxRule } from './syntax-rules';

@Injectable()
export class AddEventListenerRule implements SyntaxRule {
  match(attribute: string) {
    return attribute.charAt(0) === '(';
  }

  apply(
    changeDetector: ChangeDetector,
    executionContext: ExecutionContext,
    element: HTMLElement,
    eventNameAndSuffix: string,
    expression: string,
  ) {
    const [eventName, ...suffixes] = eventNameAndSuffix.split('.');
    const capture = eventName === 'focus' || eventName === 'blur';
    const eventHandler = ($event: Event) => executionContext.run(expression, { $event });
    const callback = (event: Event) => {
      if (suffixes.includes('once')) {
        element.removeEventListener(eventName, callback, { capture });
      }

      if (suffixes.includes('stop')) {
        event.preventDefault();
        event.stopPropagation();
      }

      eventHandler.apply(element, [event]);
      changeDetector.markAsDirtyAndCheck();
    };

    element.addEventListener(eventName, callback, { capture });
  }
}
