import { Subject } from 'rxjs';
import { ChangeDetector } from './change-detection';
import { AnyFunction } from './utils';

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

export function attachEvent(cd: ChangeDetector, element: HTMLElement, eventNameAndSuffix: string, expression: AnyFunction) {
  const [eventName, suffix] = eventNameAndSuffix.split('.');
  const useCapture = eventName === 'focus' || eventName === 'blur';
  const fn = (event: Event) => cd.run(() => {
    cd.markForCheck();

    if (suffix === 'once') {
      element.removeEventListener(eventName, fn, { capture: useCapture });
    }

    if (suffix === 'stop') {
      event.preventDefault();
      event.stopPropagation();
    }

    expression.apply(element, [event]);
  });

  element.addEventListener(eventName, fn, { capture: useCapture });
}
