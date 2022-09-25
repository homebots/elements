import 'reflect-metadata';
import { ChangeDetectionPlugin } from './change-detection/change-detection.plugin';
import { CustomElement } from './custom-element';
import { InjectorPlugin } from './dependency-injection/injector.plugin';
import { TemplatePlugin, TemplateRef } from './dom/template.plugin';

export { Application, Bootstrap, BootstrapOptions } from './bootstrap';
export {
  Change,
  ChangeCallback,
  ChangeDetector,
  ChangeDetectorRef,
  Changes,
  Expression,
  Watcher
} from './change-detection/change-detection';
export { ReactiveChangeDetector } from './change-detection/reactive-change-detector';
export { ZoneChangeDetector } from './change-detection/zone-change-detector';
export {
  ComponentOptions, CustomElement, CustomElementPlugin, CustomHTMLElement, LifecycleHook,
  OnDestroy,
  OnInit
} from './custom-element';
export { Child, Children, Component, Input, Output } from './component-decorators';
export { ContainerRegistry } from './containers/registry';
export { Dom } from './dom/dom';
export { DomScanner } from './dom/dom-scanner';
export { dispatchDomEvent, DomEventEmitter, Emitter, EventCallback, EventEmitter } from './events';
export { ExecutionContext, ExecutionLocals, NullContext, SealedExecutionContext } from './execution-context';
export { InputOptions } from './inputs';
export { ShadowDomToggle } from './settings';
export { AddEventListenerRule } from './syntax/add-event-listener.rule';
export { NodeReferenceRule } from './syntax/node-reference.rule';
export { SetAttributeRule } from './syntax/set-attribute.rule';
export { SetClassRule } from './syntax/set-class.rule';
export { SetPropertyRule } from './syntax/set-property.rule';
export { SyntaxRules } from './syntax/syntax-rules';
export { ViewContainerRule } from './syntax/view-container.rule';
export { domReady, noop } from './utils';
export { InjectorPlugin, ChangeDetectionPlugin, TemplatePlugin, TemplateRef };

CustomElement.use(new InjectorPlugin());
CustomElement.use(new ChangeDetectionPlugin());
CustomElement.use(new TemplatePlugin());

if (typeof globalThis !== 'undefined') {
  globalThis.CustomElement = CustomElement;
}