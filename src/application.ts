import { ChangeDetector, ChangeDetectorRef, ZoneChangeDetector } from './change-detection';
import { InjectionToken, Injector, InjectorSymbol, Provider } from './injector';

export type ApplicationRef = InjectionToken<Application>;
export const ApplicationRef = Symbol('ApplicationRef');

export class Application {
  private changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    const injector = rootNode[InjectorSymbol] = new Injector(null, providers);
    this.changeDetector = injector.get(ChangeDetectorRef);

    injector.register({ type: ApplicationRef, useValue: this });
  }

  tick() {
    this.changeDetector.scheduleCheck();
  }
}
