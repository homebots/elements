import { default as clone } from 'lodash.clone';
import { default as isEqual } from 'lodash.isequal';
import { AnyFunction, setTimeoutNative } from '../utils';
import { CustomHTMLElement } from '../component';
import { ChangeCallback, ChangeDetector, Changes, Expression, Watcher } from './change-detection';

let uid = 0;

export class ReactiveChangeDetector implements ChangeDetector {
  readonly id = `@${++uid}`;
  protected children = new Map<HTMLElement, ReactiveChangeDetector>();

  private timer = 0;
  protected state: 'checking' | 'checked' | 'dirty' = 'dirty';
  private watchers: Watcher[] = [];
  private _afterCheck: AnyFunction[] = [];
  private _beforeCheck: AnyFunction[] = [];

  constructor(protected target: CustomHTMLElement = null, public parent: ReactiveChangeDetector = null) {
    if (this.parent) {
      this.parent.children.set(this.target, this);
    }
  }

  beforeCheck(fn: AnyFunction) {
    this._beforeCheck.push(fn);
  }

  afterCheck(fn: AnyFunction) {
    this._afterCheck.push(fn);
  }

  unregister() {
    if (this.parent) {
      this.parent.children.delete(this.target);
    }
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    try {
      return callback.apply(applyThis, applyArgs);
    } catch (error) {
      console.log(error);
    }
  }

  watch<T>(expression: Watcher | Expression<T>): void;
  watch<T>(expression: Watcher | Expression<T>, callback?: ChangeCallback<T>, useEquals = false) {
    if (typeof expression !== 'function') {
      this.watchers.push(expression as Watcher);
      return;
    }

    this.watchers.push({
      expression: expression as Expression<T>,
      callback,
      useEquals,
    });
  }

  markTreeForCheck() {
    this.state = 'dirty';
    this.children.forEach((child) => child.markTreeForCheck());
  }

  markAsDirtyAndCheck() {
    this.markTreeForCheck();

    if (!this.timer) {
      this.scheduleTreeCheck();
    }
  }

  check() {
    if (this.state === 'checked') {
      return;
    }

    const inputChanges = new Changes();

    this._beforeCheck.forEach((fn) => fn());

    this.state = 'checking';
    this.watchers.forEach((watcher) => this.checkWatcher(inputChanges, watcher));

    this._afterCheck.forEach((fn) => fn(inputChanges));

    if (this.state !== 'checking') {
      this.scheduleTreeCheck();
      return;
    }

    this.state = 'checked';
  }

  protected checkWatcher(changes: Changes, watcher: Watcher) {
    const newValue = this.runWatcher(watcher.expression, this.target, []);
    const lastValue = watcher.lastValue;
    const useEquals = watcher.useEquals;
    const hasChanges = (!useEquals && newValue !== lastValue) || (useEquals && !isEqual(newValue, lastValue));

    if (!hasChanges) {
      return false;
    }

    if (watcher.property) {
      changes.set(watcher.property, {
        value: newValue,
        lastValue,
        firstTime: watcher.firstTime,
      });

      watcher.firstTime = false;
    }

    watcher.lastValue = useEquals ? clone(newValue) : newValue;

    if (watcher.callback) {
      this.runWatcherCallback(watcher.callback, null, [newValue, lastValue]);
    }
  }

  protected runWatcher(...args: any[]) {
    return this.run.apply(this, args);
  }

  protected runWatcherCallback(...args: any[]) {
    return this.run.apply(this, args);
  }

  checkTree() {
    this.check();
    this.children.forEach((cd) => cd.checkTree());
  }

  scheduleTreeCheck() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeoutNative(() => {
      this.checkTree();
      this.timer = 0;
    }, 1);
  }

  fork(target?: any) {
    return new ReactiveChangeDetector(target || this.target, this);
  }
}
