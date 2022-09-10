import { Inject, InjectionToken, Injector, Provider, Value } from '@homebots/injector';
import { ChangeDetector, ChangeDetectorRef } from './change-detection/change-detection';
import { ExecutionContext, NullContext } from './execution-context';

export const ApplicationRef = new InjectionToken<Application>('ApplicationRef');

export class Application {
  @Inject(ChangeDetectorRef) changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    this.setupInjector(rootNode, providers);
  }

  protected setupInjector(rootNode: HTMLElement, providers: Provider<unknown>[]) {
    const injector = Injector.global;

    Injector.setInjectorOf(rootNode, injector);
    Injector.setInjectorOf(this, injector);

    injector.provideAll(providers);
    injector.provide(ApplicationRef, Value(this));
    injector.provide(ExecutionContext, Value(NullContext));
  }

  check() {
    this.changeDetector.markAsDirtyAndCheck();
  }
}
