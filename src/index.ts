import 'reflect-metadata';

export { Bootstrap, BootstrapOptions, Application } from './bootstrap';

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
  CustomElementPlugin,
  LifecycleHook,
  OnBeforeCheck,
  OnDestroy,
  OnInit,
  TemplateRef,
  CustomElement,
} from './component';

export { ContainerRegistry } from './containers/registry';
export { DomScanner } from './dom/dom-scanner';
export { Dom } from './dom/dom';
export { Emitter, EventCallback, DomEventEmitter, EventEmitter, dispatchDomEvent } from './events';
export { ExecutionContext, ExecutionLocals, SealedExecutionContext, NullContext } from './execution-context';
export { InputOptions } from './inputs';
export { noop, domReady } from './utils';
export { ShadowDomToggle } from './settings';

export { SyntaxRules } from './syntax/syntax-rules';
export { AddEventListenerRule } from './syntax/add-event-listener.rule';
export { NodeReferenceRule } from './syntax/node-reference.rule';
export { SetAttributeRule } from './syntax/set-attribute.rule';
export { SetClassRule } from './syntax/set-class.rule';
export { SetPropertyRule } from './syntax/set-property.rule';
export { ViewContainerRule } from './syntax/view-container.rule';
