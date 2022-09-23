import { Injector, Provider, TreeInjector, Value } from '@homebots/injector';
import { ChangeDetector, ChangeDetectorRef } from './change-detection/change-detection';

export class Application {
  get changeDetector(): ChangeDetector {
    return this.injector.get(ChangeDetectorRef);
  }

  get injector(): Injector {
    return Injector.getInjectorOf(this.rootNode);
  }

  constructor(private rootNode: HTMLElement, providers: Provider[]) {
    this.setupInjector(rootNode, providers);
    (rootNode as any).application = this;
  }

  protected setupInjector(rootNode: HTMLElement, providers: Provider<unknown>[]) {
    const injector = new TreeInjector();

    Injector.setInjectorOf(rootNode, injector);
    injector.provideAll(providers);
    injector.provide(Application, Value(this));
  }

  async check() {
    return this.changeDetector.markAsDirtyAndCheck();
  }
}
