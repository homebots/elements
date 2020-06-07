import * as isEqual from 'lodash.isequal';
import * as clone from 'lodash.clone';
import { Injector, InjectionToken } from './injector';
import { ZoneRef } from './zone';
import { AnyFunction } from './utils';
import { CustomElement } from './component';

export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined) => void;
export type Expression<T> = () => T;

export interface Watcher {
  expression: AnyFunction;
  callback?: ChangeCallback<unknown>;
  lastValue?: any;
  useEquals?: boolean;
}

interface ZoneProperties {
  changeDetector: ChangeDetector;
}

let uid = 0;

export const ChangeDetectorRef: InjectionToken<ChangeDetector> = Symbol('ChangeDetector');

export interface ChangeDetector {
  children: Map<HTMLElement, ChangeDetector>;
  parent?: ChangeDetector;
  root: ChangeDetector;
  name?: string;

  scheduleCheck(): void;
  check(): void;
  markForCheck(): void;
  unregister(): void;
  beforeCheck(): void;
  afterCheck(): void;
  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals?: boolean): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
}

export class ZoneChangeDetector implements ZoneSpec, ChangeDetector {
  children = new Map<HTMLElement, ChangeDetector>();
  root: ChangeDetector;

  constructor(
    private component: CustomElement = null,
    public parent: ChangeDetector = null,
    private injector: Injector = null,
  ) {
    if (this.parent) {
      this.parent.children.set(this.component, this);
      this.root = this.parent.root;
    }
  }

  readonly name = `@${++uid}`;
  readonly properties: ZoneProperties = { changeDetector: this };

  private checked = false;
  private watchers: Watcher[] = [];
  private _zone: Zone;
  private timer = 0;

  private get zone() {
    if (!this._zone) {
      this._zone = this.injector.get(ZoneRef);
    }

    return this._zone;
  }

  private get isRoot() {
    return this.root === this;
  }

  beforeCheck() {
    if (this.component) {
      (this.component as any).onBeforeCheck();
    }
  }

  afterCheck() {}

  unregister() {
    this.parent.children.delete(this.component);
  }

  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T {
    return this.zone.runGuarded(callback, applyThis, applyArgs, source);
  }

  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals = false) {
    this.watchers.push({
      expression,
      callback,
      useEquals,
    });
  }

  markForCheck() {
    this.checked = false;
    this.children.forEach(child => child.markForCheck());
  }

  check() {
    this.beforeCheck();
    this.children.forEach(cd => cd.check());

    if (this.checked) return;

    this.watchers.forEach(watcher => {
      const newValue = this.zone.runGuarded(watcher.expression, this.component, [], this.name);
      const lastValue = watcher.lastValue;

      const useEquals = watcher.useEquals;
      const hasChanges = (!useEquals && newValue !== lastValue) || (useEquals && !isEqual(newValue, lastValue));

      if (hasChanges) {
        if (watcher.callback) {
          this.zone.runGuarded(watcher.callback, null, [newValue, lastValue], this.name);
        }

        watcher.lastValue = useEquals ? clone(newValue) : newValue;
      }
    });

    this.afterCheck();
    this.checked = true;
  }

  scheduleCheck() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = (window as any).__zone_symbol__setTimeout(() => {
      this.root.check();
      this.timer = 0;
    }, 1);
  }

  private markZoneForCheck(zone: Zone) {
    const targetArea: ChangeDetector = zone.get('changeDetector');
    targetArea.markForCheck();
  }

  onInvoke(delegate: ZoneDelegate, _: Zone, target: Zone, callback: VoidFunction, applyThis: any, applyArgs: any[], source: string) {
    const output = delegate.invoke(target, callback, applyThis, applyArgs);
    this.markZoneForCheck(target);
    this.scheduleCheck();

    return output;
  }

  onInvokeTask(delegate: ZoneDelegate, _: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any[]) {
    const output = delegate.invokeTask(target, task, applyThis, applyArgs);
    this.markZoneForCheck(target);
    this.scheduleCheck();

    return output;
  }

  onScheduleTask(delegate: ZoneDelegate, _: Zone, target: Zone, task: Task) {
    const scheduledTask = delegate.scheduleTask(target, task);
    this.markZoneForCheck(target);
    this.scheduleCheck();

    return scheduledTask;
  }
}
