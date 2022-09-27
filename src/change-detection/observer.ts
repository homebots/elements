import { default as clone } from 'lodash.clone';
import { default as isEqual } from 'lodash.isequal';

import { AnyFunction } from '../utils';

export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime?: boolean;
}

export type Changes = Record<string, Change<any>>;
export type ChangesCallback = (changes: Changes) => void;
export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined, firstTime: boolean) => void;
export type Expression<T> = () => T;

export interface Watcher<T = any> {
  expression: Expression<T>;
  callback?: ChangeCallback<T>;
  lastValue?: T | undefined;
  useEquals?: boolean;
  property?: string;
  firstTime?: boolean;
}

export interface IObserver {
  beforeCheck(fn: AnyFunction): void;
  afterCheck(fn: AnyFunction): void;
  check(): void;
  markAsDirty(): void;
  watch(expression: Watcher): void;
}

export class Observer implements IObserver {
  protected timer = 0;
  protected state: 'checking' | 'checked' | 'dirty' | 'suspended' = 'suspended';
  protected watchers: Watcher[] = [];
  protected _afterCheck: AnyFunction[] = [];
  protected _beforeCheck: AnyFunction[] = [];

  beforeCheck(fn: AnyFunction) {
    this._beforeCheck.push(fn);
  }

  afterCheck(fn: AnyFunction) {
    this._afterCheck.push(fn);
  }

  markAsDirty() {
    this.state = 'dirty';
  }

  watch<T>(watcher: Watcher<T>) {
    this.watchers.push({ ...watcher, firstTime: true });
  }

  check() {
    if (this.state === 'checked' || this.state === 'suspended') {
      return;
    }

    this._beforeCheck.forEach((fn) => fn());
    this.state = 'checking';

    for (const watcher of this.watchers) {
      this.checkWatcher(watcher);
    }

    this._afterCheck.forEach((fn) => fn());

    this.state = 'checked';
  }

  protected checkWatcher(watcher: Watcher) {
    const newValue = watcher.expression();
    const { firstTime, lastValue, useEquals } = watcher;
    const hasChanges = (!useEquals && newValue !== lastValue) || (useEquals && !isEqual(newValue, lastValue));

    if (!hasChanges) {
      return false;
    }

    watcher.firstTime = false;
    watcher.lastValue = useEquals ? clone(newValue) : newValue;

    if (watcher.callback) {
      watcher.callback.apply(null, [newValue, lastValue, firstTime]);
    }
  }
}
