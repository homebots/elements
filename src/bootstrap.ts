import { Application } from './application';
import { ChangeDetectorRef, ZoneChangeDetector } from './change-detection';
import { Provider } from './injector';
import { AnyFunction } from './utils';

class Bootstrap {
  private resolve?: AnyFunction;
  private promise?: Promise<Application>;

  constructor() {
    this.promise = new Promise((resolve) => this.resolve = resolve);
  }

  tick(app: Application) {
    this.resolve(app);
  }

  whenReady(fn: () => any) {
    this.promise = this.promise.then(fn);
  }
}

export const BOOTSTRAP = new Bootstrap();

export interface BootstrapOptions {
  rootNode?: HTMLElement;
  providers: Provider[];
}


export function bootstrap(options?: BootstrapOptions) {
  if (!options) {
    const zoneChangeDetector = new ZoneChangeDetector();

    options = {
      rootNode: document.body,
      providers: [
        { type: ChangeDetectorRef, useValue: zoneChangeDetector },
      ]
    }
  }

  const { rootNode, providers } = options;

  domReady().then(function() {
    const app = new Application(rootNode || document.body, providers);
    BOOTSTRAP.whenReady(() => app.tick());
    BOOTSTRAP.tick(app);
    return app;
  }).catch(console.log);
}

// Thanks @stimulus:
// https://github.com/stimulusjs/stimulus/blob/master/packages/%40stimulus/core/src/application.ts
export function domReady() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

