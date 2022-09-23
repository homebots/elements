import { Injector, Provider, TreeInjector, Value } from '@homebots/injector';
import { DomScanner } from './dom/dom-scanner';
import { ChangeDetector, ChangeDetectorRef } from './change-detection/change-detection';
import { ExecutionContext } from './execution-context';

export class Application {
  private changeDetector: ChangeDetector;

  constructor(rootNode: HTMLElement, providers: Provider[]) {
    this.setupInjector(rootNode, providers);
    (rootNode as any).application = this;

    const injector = this.injector();
    this.changeDetector = injector.get(ChangeDetectorRef);
    injector.get(DomScanner).scanTree(rootNode, this.changeDetector, new ExecutionContext(rootNode));
  }

  protected setupInjector(rootNode: HTMLElement, providers: Provider<unknown>[]) {
    const injector = new TreeInjector();

    Injector.setInjectorOf(rootNode, injector);
    Injector.setInjectorOf(this, injector);

    injector.provideAll(providers);
    injector.provide(Application, Value(this));
  }

  async check() {
    return this.changeDetector.markAsDirtyAndCheck();
  }

  injector(): Injector {
    return Injector.getInjectorOf(this);
  }
}
