import { Injector, Provider, TreeInjector } from '@homebots/injector';
import { ChangeDetector } from './change-detection/change-detection';
import { ChangeDetectionPlugin } from './plugins/change-detection.plugin';
import { CustomElement } from './custom-element';
import { ForContainer } from './containers/for-container';
import { IfContainer } from './containers/if-container';
import { ContainerRegistry } from './containers/registry';
import { DomScanner } from './dom/dom-scanner';
import { ExecutionContext } from './execution-context';
import { ShadowDomToggle } from './settings';
import { AddEventListenerRule } from './syntax/add-event-listener.rule';
import { NodeReferenceRule } from './syntax/node-reference.rule';
import { SetAttributeRule } from './syntax/set-attribute.rule';
import { SetClassRule } from './syntax/set-class.rule';
import { SetPropertyRule } from './syntax/set-property.rule';
import { SyntaxRules } from './syntax/syntax-rules';
import { ViewContainerRule } from './syntax/view-container.rule';
import { domReady } from './utils';

export interface BootstrapOptions {
  providers?: Provider[];
  useShadowDom?: boolean;
}

export interface Application {
  injector: Injector;
  changeDetector: ChangeDetector;
  check(): Promise<void> | void;
}

export class Bootstrap {
  static createApplication(rootNode: HTMLElement = document.body, options: BootstrapOptions = {}): Application {
    const injector = Bootstrap.setupInjector(rootNode, options.providers);

    if (options.useShadowDom !== undefined) {
      injector.provide(ShadowDomToggle);
      injector.get(ShadowDomToggle).toggle(options.useShadowDom);
    }

    if (!CustomElement.isCustomElement(rootNode)) {
      ChangeDetector.setDetectorOf(rootNode, ChangeDetectionPlugin.root);
      injector.get(DomScanner).scanTree(rootNode, ChangeDetectionPlugin.root, new ExecutionContext(rootNode));
    }

    const app = {
      injector,
      changeDetector: ChangeDetectionPlugin.root,
      check() {
        return ChangeDetectionPlugin.root.detectChanges();
      },
    };

    domReady().then(() => app.check());

    return app;
  }

  static setupInjector(rootNode: HTMLElement, providers: Provider[] = []) {
    const injector = new TreeInjector();

    Injector.setInjectorOf(rootNode, injector);
    injector.provideAll(providers);

    return injector;
  }
}

domReady().then(() => {
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
});
