import { Application } from './application';
import { AnyFunction } from './utils';

class Bootstrap {
  private resolve?: AnyFunction;
  private promise?: Promise<Application>;

  constructor() {
    this.promise = new Promise((resolve) => this.resolve = resolve);
  }

  tick() {
    this.resolve();
  }

  whenStable(fn: () => any) {
    this.promise = this.promise.then(fn);
  }
}

export const BOOTSTRAP = new Bootstrap();

export function bootstrap() {
  domReady().then(function() {
    const app = new Application(document.body);
    BOOTSTRAP.tick();
    BOOTSTRAP.whenStable(() => app.tick());
  });
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
