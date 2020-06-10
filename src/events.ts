import { Subject } from 'rxjs';
import { ChangeDetector } from './change-detection';
import { Fn } from './utils';
import { ExecutionContext } from './execution-context';

export type EventCallback<T = any> = (event: T) => void;

export interface EventEmitter<T> {
  emit(data: T): void;
}

export class DomEventEmitter<T> implements EventEmitter<T> {
  static emitEvent(element: HTMLElement, event: string, detail: any = {}) {
    const customEvent = new CustomEvent(event, {
      detail,
      bubbles: true,
    });

    element.dispatchEvent(customEvent);
  }

  constructor(
    private element: HTMLElement,
    private event: string,
  ) {}

  emit(data: T) {
    DomEventEmitter.emitEvent(this.element, this.event, data);
  }
}

class ClassEventEmitter<T> implements EventEmitter<T> {
  private emitter = new Subject<T>();
  constructor() {}

  addEventListener(callback: EventCallback<T>) {
    return this.emitter.subscribe(callback);
  }

  emit(data: T) {
    this.emitter.next(data);
  }
}

export function Output(eventName?: string) {
  return function (target: any, property: string) {
    // NOTE! event names are always lower case!
    eventName = (eventName || property).toLowerCase();

    Object.defineProperty(target, property, {
      get() {
        return this[eventName] || (this[eventName] = new DomEventEmitter<any>(this, eventName));
      },
    });
  };
}

export const EventEmitter = ClassEventEmitter;

export function addEventHandler(cd: ChangeDetector, executionContext: ExecutionContext, element: HTMLElement, eventNameAndSuffix: string, expression: string) {
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
    cd.markForCheck();
    cd.scheduleCheck();
  });

  element.addEventListener(eventName, callback, { capture: useCapture });
}
