import { Subject } from 'rxjs';
import { ChangeDetector } from './change-detection';
import { Fn } from './utils';
import { ExecutionContext } from './execution-context';

export type EventCallback<T = any> = (event: T) => void;

export interface EventEmitter<T> {
  emit(data: T): void;
}

export class DomEventEmitter<T> implements EventEmitter<T> {
  constructor(
    private element: HTMLElement,
    private event: string,
  ) {}

  emit(data: T) {
    dispatchEvent(this.element, this.event, data);
  }
}

export function Output(eventName: string) {
  return function (target: any, property: string) {
    // NOTE: DOM event names are always lower case
    const emitter = new DomEventEmitter<any>(this, eventName.toLowerCase());
    Object.defineProperty(target, property, { value: emitter });
  };
}

export function addEventListener(cd: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, eventNameAndSuffix: string, expression: string) {
  const eventHandler = ($event: Event) => executionContext.run(expression, { $event });
  const [eventName, suffix] = eventNameAndSuffix.split('.');
  const useCapture = eventName === 'focus' || eventName === 'blur';
  const callback = (event: Event) => cd.run(() => {
    if (suffix === 'once') {
      element.removeEventListener(eventName, callback, { capture: useCapture });
    }

    if (suffix === 'stop') {
      event.preventDefault();
      event.stopPropagation();
    }

    eventHandler.apply(element, [event]);
    cd.markTreeForCheck();
    cd.scheduleTreeCheck();
  });

  element.addEventListener(eventName, callback, { capture: useCapture });
}

export function dispatchEvent(element: HTMLElement, event: string, detail: any = {}) {
  const customEvent = new CustomEvent(event, {
    detail,
    bubbles: true,
  });

  return element.dispatchEvent(customEvent);
}

