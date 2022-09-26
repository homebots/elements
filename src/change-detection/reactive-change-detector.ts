import { setTimeoutNative } from '../utils';
import { ChangeDetector, CheckOptions } from './change-detection';
import { Observer } from './observer';

let uid = 0;

export class ReactiveChangeDetector extends Observer implements ChangeDetector {
  readonly id = `@${++uid}`;
  readonly root: ChangeDetector = this;
  parent: ChangeDetector;
  children: Array<ChangeDetector> = [];

  constructor() {
    super();

    if (this.parent) {
      this.root = this.parent.root;
    }
  }

  detach() {
    if (this.parent && this.parent.children) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  attachToParent<T extends ChangeDetector>(cd: T) {
    this.children.push(cd);
    cd.parent = this;
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    try {
      return callback.apply(applyThis, applyArgs);
    } catch (error) {
      console.log(error);
    }
  }

  markTreeForCheck() {
    this.state = 'dirty';
    for (const child of this.children) {
      child.markTreeForCheck();
    }
  }

  detectChanges(): Promise<void> | void {
    this.markTreeForCheck();
    return this.scheduleTreeCheck();
  }

  checkTree() {
    this.check();
    this.children.forEach((cd) => cd.checkTree());
  }

  scheduleTreeCheck(options?: CheckOptions) {
    if (this.root !== this) {
      return this.root.scheduleTreeCheck(options);
    }

    if (!options?.async) {
      this.checkTree();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    return new Promise<void>((resolve) => {
      this.timer = setTimeoutNative(() => {
        this.checkTree();
        this.timer = 0;
        resolve(null);
      }, 1);
    });
  }

  fork() {
    const cd = new ReactiveChangeDetector();
    this.attachToParent(cd);

    return cd;
  }

  toString() {
    return this.id;
  }

}
