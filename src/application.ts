import { Inject, InjectionToken, Injector, Provider, setInjectorOf, Value } from '@homebots/injector';
import { ChangeDetector } from './change-detection';
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
  @Inject() changeDetector: ChangeDetector;
  @Inject() syntaxRules: SyntaxRules;
  readonly injector: Injector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    this.injector = this.createInjector(rootNode, providers);
    this.addSyntaxRules();
  }

  protected createInjector(rootNode: HTMLElement, providers: Provider<unknown>[]) {
    const injector = new Injector();

    setInjectorOf(rootNode, injector);

    injector.provideAll(providers);
    injector.provide(ApplicationRef, Value(this));
    injector.provide(ExecutionContext, Value(NullContext));

    return injector;
  }

  protected addSyntaxRules() {
    const { syntaxRules, injector } = this;
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
