export const isCustomElement = Symbol('CustomElement');
export const tag = Symbol('CustomElementTag');

export interface CustomElementOptions {
  tag: string;
  extends?: string;
}

export type LifecycleHook = () => void;

export class CustomHTMLElement extends HTMLElement {
  parentComponent: CustomHTMLElement | null;
  [isCustomElement]: boolean;

  onInit?: LifecycleHook;
  onDestroy?: LifecycleHook;
}

export interface Composition<Component extends CustomHTMLElement, ExtendedProperties = {}, Options = {}> {
  onCreate?(input: Component, options: Options): Component & ExtendedProperties;
  onConnect?(element: Component, options: Options): void;
  onInit?(element: Component, options: Options): void;
  onMove?(element: Component, options: Options, oldParent: Component, newParent: Component): void;
  onDisconnect?(element: Component): void;
  onError?(element: Component, error: any): void;
}
