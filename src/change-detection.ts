import * as clone from 'lodash.clone';
import * as isEqual from 'lodash.isequal';
import 'zone.js/dist/zone.js';
import { CustomElement } from './component';
import { InjectionToken } from './injector';
import { AnyFunction, setTimeoutNative } from './utils';

export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined) => void;
export type Expression<T> = () => T;

export interface Watcher {
  expression: AnyFunction;
  callback?: ChangeCallback<unknown>;
  lastValue?: any;
  useEquals?: boolean;
}

let uid = 0;

export const ChangeDetectorRef: InjectionToken<ChangeDetector> = Symbol('ChangeDetector');

export interface ChangeDetector {
  id?: string;
  parent?: ChangeDetector;

  beforeCheck(): void;
  afterCheck(fn: AnyFunction): void;

  markForCheck(): void;
  scheduleCheck(): void;
  check(): void;
  checkTree(): void;
  unregister(): void;
  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals?: boolean): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  fork(component?: CustomElement): ChangeDetector;
}

export class BaseChangeDetector implements ChangeDetector {
  readonly id = `@${++uid}`;
  protected children = new Map<HTMLElement, BaseChangeDetector>();
  protected root: ChangeDetector;

  private timer = 0;
  protected state: 'checking' | 'checked' | 'dirty' = 'dirty';
  private watchers: Watcher[] = [];
  private _afterCheck: AnyFunction[] = [];

  constructor(
    protected component: CustomElement = null,
    public parent: BaseChangeDetector = null,
  ) {
    if (this.parent) {
      this.parent.children.set(this.component, this);
      this.root = this.parent.root;
    }
  }

  beforeCheck() {
    if (this.component) {
      (this.component as any).onBeforeCheck();
    }
  }

  afterCheck(fn: AnyFunction) {
    this._afterCheck.push(fn);
  }

  unregister() {
    if (this.parent) {
      this.parent.children.delete(this.component);
    }
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    try {

      return callback.apply(applyThis, applyArgs);
    } catch (error) {
      console.log(error)
    }
  }

  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals = false) {
    this.watchers.push({
      expression,
      callback,
      useEquals,
    });
  }

  markForCheck() {
    this.state = 'dirty';
    this.children.forEach(child => child.markForCheck());
  }

  check() {
    if (this.state === 'checked') return;

    this.beforeCheck();
    this.state = 'checking';

    this.watchers.forEach(watcher => {
      const newValue = this.run(watcher.expression, this.component, []);
      const lastValue = watcher.lastValue;

      const useEquals = watcher.useEquals;
      const hasChanges = (!useEquals && newValue !== lastValue) || (useEquals && !isEqual(newValue, lastValue));

      if (hasChanges) {
        if (watcher.callback) {
          this.run(watcher.callback, null, [newValue, lastValue]);
        }

        watcher.lastValue = useEquals ? clone(newValue) : newValue;
      }
    });

    this.onAfterCheck();

    if (this.state !== 'checking') {
      this.scheduleCheck();
      return;
    }

    this.state = 'checked';
  }

  checkTree() {
    this.check();
    this.children.forEach(cd => cd.checkTree());
  }

  scheduleCheck() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeoutNative(() => {
      this.checkTree();
      this.timer = 0;
    }, 1);
  }

  fork(component?: CustomElement) {
    return new BaseChangeDetector(component || this.component, this);
  }

  private onAfterCheck() {
    this._afterCheck.forEach(fn => fn());
  }
}

interface ZoneProperties {
  changeDetector: ChangeDetector;
}

export class ZoneChangeDetector extends BaseChangeDetector implements ZoneSpec, ChangeDetector {
  get name() {
    return this.id;
  }

  readonly properties: ZoneProperties = { changeDetector: this };

  parent: ZoneChangeDetector;
  protected _zone: Zone;

  private get zone() {
    if (!this._zone) {
      this._zone = this.parent._zone.fork(this);
    }

    return this._zone;
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    return this.zone.runGuarded(callback, applyThis, applyArgs, this.id);
  }

  fork(component: CustomElement) {
    return new ZoneChangeDetector(component, this);
  }

  onInvoke(delegate: ZoneDelegate, _: Zone, target: Zone, callback: VoidFunction, applyThis: any, applyArgs: any[], source: string) {
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
    changeDetector.markForCheck();
    changeDetector.scheduleCheck();
  }
}
