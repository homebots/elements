export { Application, ApplicationRef } from './application';
export { Bootstrap, BootstrapOptions } from './bootstrap';

export {
  Change,
  ChangeCallback,
  ChangeDetector,
  ChangeDetectorRef,
  Changes,
  Expression,
  Watcher,
} from './change-detection/change-detection';
export { ReactiveChangeDetector } from './change-detection/reactive-change-detector';
export { ZoneChangeDetector } from './change-detection/zone-change-detector';

export { Component, Child, Children, Input, Output } from './component-decorators';

export {
  ComponentOptions,
  CustomHTMLElement,
  HostAttributes,
  LifecycleHook,
  OnBeforeCheck,
  OnDestroy,
  OnInit,
  ShadowRootInit,
  TemplateRef,
  CustomElement,
} from './component';

export { ContainerRegistry } from './containers/registry';
export { DomScanner } from './dom-scanner';
export { DomEventEmitter, EventCallback, EventEmitter, dispatchDomEvent } from './events';
export { ExecutionContext, ExecutionLocals, SealedExecutionContext, NullContext } from './execution-context';
export { InputOptions } from './inputs';
export { createTemplateFromHtml, noop, domReady } from './utils';
export { ShadowDomToggle } from './settings';
