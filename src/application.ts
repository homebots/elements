import { InjectionToken, Injector, InjectorSymbol, Provider } from './injector';
import { ZoneSymbol, ZoneRef } from './zone';
import { ChangeDetector, ChangeDetectorSymbol } from './change-detection';
import { IfContainer } from './if-container';

export const ApplicationRef: InjectionToken<Application> = Symbol('ApplicationRef');

export class Application {
  name = 'root-node';
  changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement) {
    const rootProviders = [IfContainer];
    const injector = rootNode[InjectorSymbol] = new Injector(null, rootProviders);
    const changeDetector= new ChangeDetector(null, null, injector);

    this.changeDetector = rootNode[ChangeDetectorSymbol] = changeDetector;
    rootNode[ZoneSymbol] = Zone.root.fork(this.changeDetector);

    injector.register({ type: ApplicationRef, useValue: this });
    injector.register({ type: ChangeDetector, useValue: this.changeDetector });
    injector.register({ type: ZoneRef, useValue: rootNode[ZoneSymbol] });
  }

  tick() {
    this.changeDetector.check();
  }
}
