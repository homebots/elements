import { Injector, Provider, TreeInjector } from '@homebots/injector';
// import { ChangeDetector } from '../change-detection/change-detection';
// import { CustomElement } from './custom-element/custom-element';
// import { DomScanner } from '../dom/dom-scanner';
// import { ExecutionContext } from '../execution-context';
// import { ChangeDetectionPlugin } from '../plugins/change-detection.plugin';
// import { ShadowDomToggle } from '../settings';
import { domReady } from './utils';

export interface BootstrapOptions {
  providers?: Provider[];
  useShadowDom?: boolean;
}

export interface Application {
  injector: Injector;
  check(): Promise<void> | void;
}

export class Bootstrap {
  static createApplication(rootNode: HTMLElement = document.body, options: BootstrapOptions = {}): Application {
    const injector = Bootstrap.setupInjector(rootNode, options.providers);

    // if (options.useShadowDom !== undefined) {
    //   injector.provide(ShadowDomToggle);
    //   injector.get(ShadowDomToggle).toggle(options.useShadowDom);
    // }

    // if (!CustomElement.isCustomElement(rootNode)) {
    //   ChangeDetector.setDetectorOf(rootNode, ChangeDetectionPlugin.root);
    //   injector.get(DomScanner).scanTree(rootNode, ChangeDetectionPlugin.root, new ExecutionContext(rootNode));
    // }


    const app = {
      injector,
      check() {
        // return ChangeDetectionPlugin.root.detectChanges();
        return null;
      },
    };

    domReady().then(() => app.check());

    return app;
  }

  static setupInjector(rootNode: HTMLElement, providers: Provider[] = []) {
    const injector = new TreeInjector();

    Injector.setInjectorOf(rootNode, injector);
    injector.provideAll(providers);

    return injector;
  }
}

// export const