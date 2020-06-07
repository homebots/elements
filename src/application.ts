import { ChangeDetector, ChangeDetectorRef, ZoneChangeDetector } from './change-detection';
import { InjectionToken, Injector, InjectorSymbol } from './injector';
import { ZoneRef } from './zone';

export type ApplicationRef = InjectionToken<Application>;
export const ApplicationRef = Symbol('ApplicationRef');

export class Application {
  private changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement) {
    const injector = rootNode[InjectorSymbol] = new Injector();
    const changeDetector = new ZoneChangeDetector(null, null, injector);
    changeDetector.root = changeDetector;

    const zone = Zone.root.fork(changeDetector);

    this.changeDetector = changeDetector;

    injector.register({ type: ApplicationRef, useValue: this });
    injector.register({ type: ChangeDetectorRef, useValue: this.changeDetector });
    injector.register({ type: ZoneRef, useValue: zone });
  }

  tick() {
    this.changeDetector.scheduleCheck();
  }
}
