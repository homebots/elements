/// <reference types="zone.js/dist/zone.js" />

import { ChangeDetector } from './change-detection';
import { ReactiveChangeDetector } from './reactive-change-detector';

interface ZoneProperties {
  changeDetector: ChangeDetector;
}

export class ZoneChangeDetector extends ReactiveChangeDetector implements ZoneSpec, ChangeDetector {
  get name() {
    return this.id;
  }

  readonly properties: ZoneProperties = { changeDetector: this };

  parent: ZoneChangeDetector | null = null;
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

  fork() {
    const cd = new ZoneChangeDetector();
    this.adopt(cd);

    return cd;
  }

  protected runWatcherCallback(callback: Function, applyThis?: any, applyArgs?: any[]) {
    return this.zone.runGuarded(callback, applyThis, applyArgs, this.id);
  }

  protected runWatcher(...args: any[]) {
    return this.tryCatch.apply(this, args);
  }

  protected tryCatch<T>(callback: Function, applyThis?: any, applyArgs?: any[]): T {
    try {
      return callback.apply(applyThis, applyArgs);
    } catch (error) {
      console.log(error);
    }
  }

  onInvoke(
    delegate: ZoneDelegate,
    _: Zone,
    target: Zone,
    callback: VoidFunction,
    applyThis: any,
    applyArgs: any[],
    __: string,
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

    changeDetector.detectChanges();
  }
}
