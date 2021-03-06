/// <reference types="zone.js/dist/zone.js" />

import * as clone from 'lodash.clone';
import * as isEqual from 'lodash.isequal';
import { CustomElement } from './component';
import { InjectionToken } from './injector';
import { AnyFunction, setTimeoutNative } from './utils';

export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined) => void;
export type Expression<T> = () => T;

export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime?: boolean;
}

export interface Changes {
  [property: string]: Change<unknown>;
}

export interface Watcher {
  expression: AnyFunction;
  callback?: ChangeCallback<unknown>;
  lastValue?: any;
  useEquals?: boolean;
  metadata?: {
    property: string;
    isInput: boolean;
    firstTime: boolean;
  };
}

let uid = 0;

export const ChangeDetectorRef: InjectionToken<ChangeDetector> = Symbol('ChangeDetector');

export interface ChangeDetector {
  id?: string;
  parent?: ChangeDetector;

  beforeCheck(fn: AnyFunction): void;
  afterCheck(fn: AnyFunction): void;

  markAsDirtyAndCheck(): void;
  markTreeForCheck(): void;
  scheduleTreeCheck(): void;
  check(): void;
  checkTree(): void;
  unregister(): void;
  watch<T>(expression: Watcher | Expression<T>): void;
  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals?: boolean): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  fork(target?: any): ChangeDetector;
}

export class ReactiveChangeDetector implements ChangeDetector {
  readonly id = `@${++uid}`;
  protected children = new Map<HTMLElement, ReactiveChangeDetector>();

  private timer = 0;
  protected state: 'checking' | 'checked' | 'dirty' = 'dirty';
  private watchers: Watcher[] = [];
  private _afterCheck: AnyFunction[] = [];
  private _beforeCheck: AnyFunction[] = [];

  constructor(protected target: CustomElement = null, public parent: ReactiveChangeDetector = null) {
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
    if (this.state === 'checked') return;

    const inputChanges: Changes = {};

    this._beforeCheck.forEach((fn) => fn(inputChanges));
    this.state = 'checking';

    const hasInputChanges = this.watchers.reduce(
      (value, watcher) => value || this.checkWatcher(inputChanges, watcher),
      false,
    );

    this._afterCheck.forEach(hasInputChanges ? (fn) => fn(inputChanges) : (fn) => fn(null));

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

    if (watcher.metadata?.isInput) {
      changes[watcher.metadata.property] = {
        value: newValue,
        lastValue,
        firstTime: watcher.metadata.firstTime,
      };

      watcher.metadata.firstTime = false;
    }

    watcher.lastValue = useEquals ? clone(newValue) : newValue;

    if (watcher.callback) {
      this.runWatcherCallback(watcher.callback, null, [newValue, lastValue]);
    }

    return watcher.metadata?.isInput;
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

interface ZoneProperties {
  changeDetector: ChangeDetector;
}

export class ZoneChangeDetector extends ReactiveChangeDetector implements ZoneSpec, ChangeDetector {
  get name() {
    return this.id;
  }

  readonly properties: ZoneProperties = { changeDetector: this };

  parent: ZoneChangeDetector;
  protected _zone: Zone;

  private get zone() {
    if (!this._zone) {
      this._zone = (this.parent?.zone || Zone.root).fork(this);
    }

    return this._zone;
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    return this.zone.runGuarded(callback, applyThis, applyArgs, this.id);
  }

  fork(component: CustomElement) {
    return new ZoneChangeDetector(component, this);
  }

  protected runWatcherCallback(callback: Function, applyThis?: any, applyArgs?: any[]) {
    return this.zone.runGuarded(callback, applyThis, applyArgs, this.id);
  }

  protected runWatcher(...args: any[]) {
    return super.run.apply(this, args);
  }

  onInvoke(
    delegate: ZoneDelegate,
    _: Zone,
    target: Zone,
    callback: VoidFunction,
    applyThis: any,
    applyArgs: any[],
    source: string,
  ) {
    const output = delegate.invoke(target, callback, applyThis, applyArgs);
    this.scheduleZoneCheck(target);

    return output;
  }

  onInvokeTask(delegate: ZoneDelegate, _: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any[]) {
    const output = delegate.invokeTask(target, task, applyThis, applyArgs);
    this.scheduleZoneCheck(target);

    return output;
  }

  onScheduleTask(delegate: ZoneDelegate, _: Zone, target: Zone, task: Task) {
    const scheduledTask = delegate.scheduleTask(target, task);
    this.scheduleZoneCheck(target);

    return scheduledTask;
  }

  private scheduleZoneCheck(zone: Zone) {
    const changeDetector: ChangeDetector = zone.get('changeDetector');

    changeDetector.markAsDirtyAndCheck();
  }
}
