import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';

export type EventCallback<T = any> = (event: T) => void;

export interface EventEmitter<T = any> {
  emit(data: T): void;
}

export class DomEventEmitter<T> implements EventEmitter<T> {
  constructor(
    private element: HTMLElement,
    private event: string,
  ) { }

  emit(data: T) {
    dispatchEvent(this.element, this.event, data);
  }
}

export function Output(eventName: string) {
  return function (target: any, property: string) {
    // NOTE: DOM event names are always lower case
    let emitter: EventEmitter;
    Object.defineProperty(target, property, {
      get() {
        if (!emitter) {
          emitter = new DomEventEmitter<any>(this, eventName.toLowerCase());
        }

        return emitter;
      }
    });
  };
}

export function dispatchEvent(element: HTMLElement, event: string, detail: any = {}) {
  const customEvent = new CustomEvent(event, {
    detail,
    bubbles: true,
  });

  return element.dispatchEvent(customEvent);
}

