export * from './custom-element/index';

// import { Injector } from '@homebots/injector';
// import 'reflect-metadata';
// import { ChangeDetectionPlugin } from './plugins/change-detection.plugin';
// import { ChangeDetectorTree } from './change-detection/change-detector-tree';

// import { InjectorPlugin } from './plugins/injector.plugin';
// import { TemplatePlugin, TemplateRef } from './plugins/template.plugin';

// import { ForContainer } from './containers/for-container';
// import { IfContainer } from './containers/if-container';
// import { ContainerRegistry } from './containers/registry';
// import { AddEventListenerRule } from './syntax/add-event-listener.rule';
// import { NodeReferenceRule } from './syntax/node-reference.rule';
// import { SetAttributeRule } from './syntax/set-attribute.rule';
// import { SetClassRule } from './syntax/set-class.rule';
// import { SetPropertyRule } from './syntax/set-property.rule';
// import { SyntaxRules } from './syntax/syntax-rules';

// export { Application, Bootstrap, BootstrapOptions } from './custom-element/bootstrap';
// export { Child, Children, Component, Input, Output } from './component-decorators';
// export { ContainerRegistry } from './containers/registry';

// export { Dom } from './dom/dom';
// export { DomScanner } from './dom/dom-scanner';
// export { dispatchDomEvent, DomEventEmitter, Emitter, EventCallback, EventEmitter } from './events';
// export { ExecutionContext, ExecutionLocals, NullContext, SealedExecutionContext } from './execution-context';
// export { InputOptions } from './inputs';
// export { ShadowDomToggle } from './settings';
// export { AddEventListenerRule } from './syntax/add-event-listener.rule';
// export { NodeReferenceRule } from './syntax/node-reference.rule';
// export { SetAttributeRule } from './syntax/set-attribute.rule';
// export { SetClassRule } from './syntax/set-class.rule';
// export { SetPropertyRule } from './syntax/set-property.rule';
// export { SyntaxRules } from './syntax/syntax-rules';
// export { InjectorPlugin, ChangeDetectionPlugin, TemplatePlugin, TemplateRef };
export { domReady, noop } from './utils';

// CustomElement.use(new InjectorPlugin());
// CustomElement.use(new ChangeDetectionPlugin());
// CustomElement.use(new TemplatePlugin());

// if (!Injector.global.canProvide(ChangeDetector)) {
//   Injector.global.provideAll([{ type: ChangeDetector, use: ChangeDetectorTree }]);
// }

// const injector = Injector.global;
// const syntaxRules = injector.get(SyntaxRules);
// const containerRegistry = injector.get(ContainerRegistry);

// syntaxRules.addRule(injector.get(NodeReferenceRule));
// syntaxRules.addRule(injector.get(SetClassRule));
// syntaxRules.addRule(injector.get(SetPropertyRule));
// syntaxRules.addRule(injector.get(SetAttributeRule));
// syntaxRules.addRule(injector.get(AddEventListenerRule));

// containerRegistry.set('if', IfContainer);
// containerRegistry.set('for', ForContainer);
