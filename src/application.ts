import { ChangeDetector, ChangeDetectorRef } from './change-detection';
import { DomHelpers } from './dom-helpers';
import { addEventHandler } from './events';
import { InjectionToken, Injector, InjectorSymbol, Provider } from './injector';
import { SyntaxRules } from './syntax-rules';
import { IfContainer } from './containers/if-container';
import { ForContainer } from './containers/for-container';
import { ContainerRegistry } from './containers/registry';

export type ApplicationRef = InjectionToken<Application>;
export const ApplicationRef = Symbol('ApplicationRef');

export class Application {
  private changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    const injector = rootNode[InjectorSymbol] = new Injector(null, providers);
    this.changeDetector = injector.get(ChangeDetectorRef);

    injector.register({ type: ApplicationRef, useValue: this });
    const syntaxRules = injector.get(SyntaxRules);
    const domUtils = injector.get(DomHelpers);
    const containerRegistry = injector.get(ContainerRegistry);

    syntaxRules.addRule(a => a.charAt(0) === '#', domUtils.readReferences.bind(domUtils));
    syntaxRules.addRule((a, e) => a.charAt(0) === '*' && e.nodeName === 'TEMPLATE', domUtils.createContainerForTemplate.bind(domUtils));
    syntaxRules.addRule(a => a.charAt(0) === '(', addEventHandler);
    syntaxRules.addRule(a => a.charAt(0) === '[' || a.charAt(0) === '*', domUtils.watchExpressionAndUpdateProperty.bind(domUtils));
    syntaxRules.addRule(a => a.charAt(0) === '@', domUtils.watchExpressionAndSetAttribute.bind(domUtils));
    syntaxRules.addRule(a => a.startsWith('class.'), domUtils.watchExpressionAndChangeClassName.bind(domUtils));

    containerRegistry.set('if', IfContainer);
    containerRegistry.set('for', ForContainer);
  }

  tick() {
    this.changeDetector.scheduleCheck();
  }
}
