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
    const flags = {
      capture: suffixes.includes('capture'),
      once: suffixes.includes('once'),
      stop: suffixes.includes('stop'),
      prevent: suffixes.includes('prevent'),
    };

    const capture = Boolean(eventName === 'focus' || eventName === 'blur' || flags.capture);
    const eventHandler = ($event: Event) =>
      executionContext.run(expression, { $event }, { async: false, noReturn: true });
    const callback = (event: Event) => {
      if (flags.once) {
        element.removeEventListener(eventName, callback, { capture });
      }

      if (flags.stop) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (flags.prevent) {
        event.preventDefault();
      }

      if (expression) {
        eventHandler.apply(element, [event]);
      }

      changeDetector.markAsDirtyAndCheck();
    };

    element.addEventListener(eventName, callback, { capture });
  }
}
