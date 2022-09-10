import { Inject, InjectionToken, Injector, Provider, Value } from '@homebots/injector';
import { ChangeDetector, ChangeDetectorRef } from './change-detection/change-detection';
import { ForContainer } from './containers/for-container';
import { IfContainer } from './containers/if-container';
import { ContainerRegistry } from './containers/registry';
import { ExecutionContext, NullContext } from './execution-context';
import { AddEventListenerRule } from './syntax/add-event-listener.rule';
import { NodeReferenceRule } from './syntax/node-reference.rule';
import { SetAttributeRule } from './syntax/set-attribute.rule';
import { SetClassRule } from './syntax/set-class.rule';
import { SetPropertyRule } from './syntax/set-property.rule';
import { SyntaxRules } from './syntax/syntax-rules';
import { ViewContainerRule } from './syntax/view-container.rule';

export const ApplicationRef = new InjectionToken<Application>('ApplicationRef');

export class Application {
  @Inject(ChangeDetectorRef) changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    this.setupInjector(rootNode, providers);
    this.addSyntaxRules();
  }

  protected setupInjector(rootNode: HTMLElement, providers: Provider<unknown>[]) {
    const injector = Injector.global;
    Injector.setInjectorOf(rootNode, injector);
    Injector.setInjectorOf(this, injector);

    injector.provideAll(providers);
    injector.provide(ApplicationRef, Value(this));
    injector.provide(ExecutionContext, Value(NullContext));
  }

  protected addSyntaxRules() {
    const injector = Injector.getInjectorOf(this);
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

  check() {
    this.changeDetector.markAsDirtyAndCheck();
  }
}
