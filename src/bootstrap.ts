import { Provider, Injector, TreeInjector } from '@homebots/injector';
import { domReady } from './utils';
import { ChangeDetector, ChangeDetectorRef } from './change-detection/change-detection';
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
  providers: [],
};

export interface BootstrapOptions {
  providers?: Provider[];
  useShadowDom?: boolean;
}

export interface Application {
  injector: Injector;
  changeDetector: ChangeDetector;
  check(): Promise<void>;
}

export class Bootstrap {
  private static promise: Promise<unknown> = domReady().then(() => Bootstrap.addDefaultRules());

  static whenReady(fn: (...args: any[]) => any) {
    return (this.promise = this.promise.then(fn));
  }

  static createApplication(rootNode: HTMLElement = document.body, options?: BootstrapOptions): Application {
    options = {
      ...defaultOptions,
      ...options,
    };

    const { providers } = options;
    providers.unshift(defaultChangeDetector);

    const injector = Bootstrap.setupInjector(rootNode, providers);
    const changeDetector = injector.get(ChangeDetectorRef);

    if (options.useShadowDom !== undefined) {
      injector.get(ShadowDomToggle).toggle(options.useShadowDom);
    }

    const app = {
      injector,
      changeDetector,
      check() {
        return changeDetector.markAsDirtyAndCheck();
      },
    };

    Bootstrap.whenReady(() => app.check());

    return app;
  }

  static setupInjector(rootNode: HTMLElement, providers: Provider[] = []) {
    const injector = new TreeInjector();

    Injector.setInjectorOf(rootNode, injector);
    injector.provideAll(providers);

    return injector;
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
