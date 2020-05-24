import { Subject } from 'rxjs';

export type EventCallback<T = any> = (event: T) => void;

export interface EventEmitter<T> {
  emit(data: T): void;
  addEventListener(callback: EventCallback<T>): void;
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

  addEventListener(callback: EventCallback) {
    this.element.addEventListener(this.event, callback);
  }

  removeEventListener(callback: EventCallback) {
    this.element.removeEventListener(this.event, callback);
  }

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
    // event names are always lower case!
    eventName = eventName || property.toLowerCase();

    Object.defineProperty(target, property, {
      get() {
        return this[eventName] || (this[eventName] = new DomEventEmitter<any>(this, eventName));
      },
    });
  };
}

export const EventEmitter = ClassEventEmitter;
