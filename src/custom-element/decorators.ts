/// <reference types="reflect-metadata" />

import { defaults } from './custom-element';
import { CustomHTMLElement, CustomElementOptions } from './types';

// import { DomEventEmitter, Emitter } from './events';
// import { ComponentOptions, CustomElement } from './custom-element/custom-element';
// import { InputOptions, INPUTS_METADATA, InputWatcher } from './inputs';
// import { domReady } from './utils';

export function Child(selector: string, isStatic?: boolean) {
  return (target: HTMLElement, property: string) => {
    let node: HTMLElement;

    Object.defineProperty(target, property, {
      get() {
        if (isStatic && node) return node;
        return (node = (this.shadowRoot || this).querySelector(selector));
      },
    });
  };
}

export function Children(selector: string) {
  return (target: HTMLElement, property: string) => {
    Object.defineProperty(target, property, {
      get() {
        return (this.shadowRoot || this).querySelectorAll(selector);
      },
    });
  };
}

export function Component<T extends CustomElementOptions>(options: T) {
  return function (ComponentClass: typeof HTMLElement) {
    defaults.define(ComponentClass, options);
  };
}

/*
export function Output(eventName: string) {
  return function (target: any, property: string) {
    // NOTE: DOM event names are always lower case
    let emitter: Emitter;
    Object.defineProperty(target, property, {
      get() {
        if (!emitter) {
          emitter = new DomEventEmitter<any>(this, eventName.toLowerCase());
        }

        return emitter;
      },
    });
  };
}

export function Input(options: InputOptions = { useEquals: false }) {
  return (target: any, property: string) => {
    const inputs: InputWatcher[] = Reflect.getMetadata(INPUTS_METADATA, target) || [];
    inputs.push({
      property,
      options,
    });

    Reflect.defineMetadata(INPUTS_METADATA, inputs, target);
  };
}
*/
