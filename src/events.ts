export type EventCallback<T = unknown> = (event: T) => void;

export interface Emitter<T = unknown> {
  emit(data: T): void;
}

export interface Callable<T> {
  (data: T): void;
}

export interface Observable<T> {
  subscribe(fn: Callable<T>): void;
  unsubscribe(fn: Callable<T>): void;
}

export class EventEmitter<T = unknown> implements Observable<T>, Emitter<T> {
  protected subscribers: Callable<T>[] = [];

  emit(data: T): void {
    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  subscribe(fn: Callable<T>): void {
    this.subscribers.push(fn);
  }

  unsubscribe(fn: Callable<T>): void {
    this.subscribers = this.subscribers.filter((callable) => callable !== fn);
  }
}

export class DomEventEmitter<T> implements Emitter<T> {
  constructor(private element: HTMLElement, private event: string) {}

  emit(data: T) {
    dispatchDomEvent(this.element, this.event, data);
  }
}

export function dispatchDomEvent<T = unknown>(element: HTMLElement, event: string, detail?: T) {
  const customEvent = new CustomEvent<T>(event, {
    detail,
    bubbles: true,
  });

  return element.dispatchEvent(customEvent);
}
