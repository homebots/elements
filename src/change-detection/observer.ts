import { default as clone } from 'lodash.clone';
import { default as isEqual } from 'lodash.isequal';

import { AnyFunction } from '../utils';
import { Watcher } from './change-detection';

export class Observer {
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

  resume() {
    this.state = 'dirty';
  }

  watch<T>(watcher: Watcher<T>) {
    this.watchers.push(watcher);
  }

  check() {
    if (this.state === 'checked' || this.state === 'suspended') {
      return;
    }

    this._beforeCheck.forEach((fn) => fn());
    this.state = 'checking';
    // console.log('checking', this.id, this.children.map(x => x.id));

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
