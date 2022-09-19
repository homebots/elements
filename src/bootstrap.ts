import { Provider, Injector } from '@homebots/injector';
import { domReady } from './utils';
import { Application } from './application';
import { ChangeDetectorRef } from './change-detection/change-detection';
import { ReactiveChangeDetector } from './change-detection/reactive-change-detector';
import { ForContainer } from './containers/for-container';
import { IfContainer } from './containers/if-container';
import { ContainerRegistry } from './containers/registry';
import { AddEventListenerRule } from './syntax/add-event-listener.rule';
import { NodeReferenceRule } from './syntax/node-reference.rule';
import { SetAttributeRule } from './syntax/set-attribute.rule';
import { SetClassRule } from './syntax/set-class.rule';
import { SetPropertyRule } from './syntax/set-property.rule';
import { SyntaxRules } from './syntax/syntax-rules';
import { ViewContainerRule } from './syntax/view-container.rule';
import { ShadowDomToggle } from './settings';

const defaultChangeDetector = { type: ChangeDetectorRef, use: ReactiveChangeDetector };
const defaultOptions = {
  providers: [defaultChangeDetector],
};

export interface BootstrapOptions {
  providers?: Provider[];
  useShadowDom?: boolean;
}

export class Bootstrap {
  private static promise: Promise<unknown> = domReady().then(() => Bootstrap.addDefaultRules());

  static whenReady(fn: (...args: any[]) => any) {
    return (this.promise = this.promise.then(fn));
  }

  static createApplication(rootNode: HTMLElement = document.body, options?: BootstrapOptions) {
    options = {
      ...defaultOptions,
      ...options,
    };

    const { providers } = options;
    const changeDetectorProvided = providers.find((p) => typeof p !== 'function' && p.type === ChangeDetectorRef);
    if (!changeDetectorProvided) {
      providers.push(defaultChangeDetector);
    }

    const application = new Application(rootNode, providers);
    Bootstrap.whenReady(() => application.check());

    if (options.useShadowDom !== undefined) {
      application.injector().get(ShadowDomToggle).toggle(options.useShadowDom);
    }

    return application;
  }

  static addDefaultRules() {
    const injector = Injector.global;
    const syntaxRules = injector.get(SyntaxRules);
    const containerRegistry = injector.get(ContainerRegistry);

    syntaxRules.addRule(injector.get(NodeReferenceRule));
    syntaxRules.addRule(injector.get(ViewContainerRule));
    syntaxRules.addRule(injector.get(SetPropertyRule));
    syntaxRules.addRule(injector.get(SetAttributeRule));
    syntaxRules.addRule(injector.get(SetClassRule));
    syntaxRules.addRule(injector.get(AddEventListenerRule));

    containerRegistry.set('if', IfContainer);
    containerRegistry.set('for', ForContainer);
  }
}
