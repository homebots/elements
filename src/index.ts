export { Application, ApplicationRef } from './application';
export { bootstrap, BOOTSTRAP, BootstrapOptions, domReady } from './bootstrap';
export { ReactiveChangeDetector, Change, ChangeCallback, ChangeDetector, ChangeDetectorRef, Changes, Expression, Watcher, ZoneChangeDetector } from './change-detection';
export { addHostAttributes, addTemplate, Component, ComponentOptions, createComponentClass, createComponentInjector, CustomElement, findParentComponent, HostAttributes, LifecycleHook, OnBeforeCheck, OnChanges, OnChangesHook, OnDestroy, OnInit, ShadowRootInit, TemplateRef } from './component';
export { ContainerRegistry } from './containers/registry';
export { DomHelpers, Child, Children, ContainerTarget, TemplateContainer } from './dom-helpers';
export { DomEventEmitter, EventCallback, EventEmitter, Output, dispatchEvent } from './events';
export { ExecutionContext, ExecutionLocals, SealedExecutionContext, NullContext } from './execution-context';
export { getInjectorFrom, Inject, Injectable, InjectableOptions, InjectionToken, Injector, InjectorSymbol, Provider, Type } from './injector';
export { Input, InputOptions } from './inputs';
export { createTemplateFromHtml, noop } from './utils';

