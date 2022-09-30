import { setTimeoutNative } from '../utils';
import { ChangeDetector, CheckOptions } from './change-detection';
import { Observer } from './observer';

let uid = 0;

export class ReactiveChangeDetector extends Observer implements ChangeDetector {
  readonly id = `@${++uid}`;
  root: ChangeDetector = this;
  parent: ChangeDetector;
  children: Array<ChangeDetector> = [];

  detach() {
    if (this.parent && this.parent.children) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  adopt<T extends ChangeDetector>(cd: T) {
    this.children.push(cd);
    cd.parent = this;
    cd.root = this.root;
  }

  markAsDirty() {
    super.markAsDirty();

    for (const child of this.children) {
      child.markAsDirty();
    }
  }

  detectChanges(options: CheckOptions = { async: true }): Promise<void> | void {
    this.markAsDirty();
    return this.scheduleCheck(options);
  }

  check() {
    super.check();

    for (const cd of this.children) cd.check();
  }

  scheduleCheck(options?: CheckOptions) {
    if (this.root !== this) {
      return this.root.scheduleCheck(options);
    }

    if (!options?.async) {
      this.check();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    return new Promise<void>((resolve) => {
      this.timer = setTimeoutNative(() => {
        this.check();
        this.timer = 0;
        resolve(null);
      }, 1);
    });
  }

  fork() {
    const cd = new ReactiveChangeDetector();
    this.adopt(cd);

    return cd;
  }

  toString() {
    return this.id;
  }
}
