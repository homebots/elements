import { Provider } from '@homebots/injector';
import { Application } from './application';
import { ChangeDetectorRef } from './change-detection/change-detection';
import { ReactiveChangeDetector } from './change-detection/reactive-change-detector';

// Thanks @stimulus:
// https://github.com/stimulusjs/stimulus/blob/master/packages/%40stimulus/core/src/application.ts
export function domReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve(undefined);
    }
  });
}

const defaultChangeDetector = { type: ChangeDetectorRef, use: ReactiveChangeDetector };
const defaultOptions = {
  rootNode: document.body,
  providers: [defaultChangeDetector],
};

export interface BootstrapOptions {
  rootNode?: HTMLElement;
  providers: Provider[];
}

export class Bootstrap {
  private static promise: Promise<unknown> = domReady();

  static whenReady(fn: (...args: any[]) => any) {
    return (this.promise = this.promise.then(fn));
  }

  static createApplication(options?: BootstrapOptions) {
    options = {
      ...defaultOptions,
      ...options,
    };

    const { rootNode, providers } = options;
    const changeDetectorProvided = providers.find((p) => typeof p !== 'function' && p.type === ChangeDetectorRef);
    if (!changeDetectorProvided) {
      providers.push(defaultChangeDetector);
    }

    const application = new Application(rootNode || document.body, providers);
    Bootstrap.whenReady(() => application.check());

    return application;
  }
}
