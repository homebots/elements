import { ChangeDetector, ChangeDetectorSymbol, ZoneChangeDetector, ChangeDetectorRef } from './change-detection';
import { InjectionToken, Injector, InjectorSymbol } from './injector';
import { ZoneRef, ZoneSymbol } from './zone';
import { createComponentInjector } from './component';

export const ApplicationRef: InjectionToken<Application> = Symbol('ApplicationRef');

export class Application {
  name = 'root-node';
  changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement) {
    const injector = rootNode[InjectorSymbol] = new Injector();
    const changeDetector = new ZoneChangeDetector(null, null, injector);
    const zone = Zone.root.fork(changeDetector);

    this.changeDetector = changeDetector;

    injector.register({ type: ApplicationRef, useValue: this });
    injector.register({ type: ChangeDetectorRef, useValue: this.changeDetector });
    injector.register({ type: ZoneRef, useValue: zone });
  }

  tick() {
    this.changeDetector.check();
  }
}
