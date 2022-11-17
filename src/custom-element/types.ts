export const customElement = Symbol('CustomElement');

export interface CustomElementOptions {
  tag: string;
  extends?: string;
}

export type LifecycleHook = () => void;

export type ConstructorType<T> = T extends { new (): infer R } ? R : never;
export type ConstructorOf<T> = new () => T;
export type CustomElementInstance<T> = ConstructorType<T> & CustomHTMLElement;

export abstract class CustomHTMLElement extends HTMLElement {
  parentComponent: CustomHTMLElement | null;
  [customElement]: boolean;
  abstract createElement<T extends typeof HTMLElement>(constructor: T): CustomElementInstance<T>;

  onInit?: LifecycleHook;
  onDestroy?: LifecycleHook;
}

export interface CustomElementPlugin<Component extends CustomHTMLElement, Options = {}> {
  onCreate?(element: Component, options: Options): Component;
  onConnect?(element: Component, options: Options): void;
  onInit?(element: Component, options: Options): void;
  onMove?(element: Component, options: Options, oldParent: Component, newParent: Component): void;
  onDisconnect?(element: Component): void;
  onError?(element: Component, error: any): void;
  onDefine?(constructor: typeof HTMLElement, options: Options): void;
}
