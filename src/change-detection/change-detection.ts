import { AnyFunction } from '../utils';

export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined, firstTime: boolean) => void;
export type Expression<T> = () => T;
export type ChangesCallback = (changes: Changes) => void;

export interface OnChanges {
  onChanges: ChangesCallback;
}

export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime?: boolean;
}

export class Changes extends Map<string, Change<unknown>> {}

export interface Watcher<T = any> {
  expression: () => T;
  callback?: ChangeCallback<T>;
  lastValue?: T | undefined;
  useEquals?: boolean;
  property?: string;
  firstTime?: boolean;
}

export interface CheckOptions {
  async: boolean;
}

export interface ChangeDetector {
  readonly root: ChangeDetector;
  id?: string;
  parent?: ChangeDetector;
  children?: ChangeDetector[];

  beforeCheck(fn: AnyFunction): void;
  afterCheck(fn: AnyFunction): void;
  detectChanges(): Promise<void> | void;
  markTreeForCheck(): void;
  scheduleTreeCheck(options?: CheckOptions): void;
  check(): void;
  checkTree(): void;
  watch(expression: Watcher): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  detach(): void;
  attachToParent(cd: ChangeDetector): void;
  fork(): ChangeDetector;
  resume(): void;
}

export class ChangeDetector {
  private static readonly tag = Symbol('ChangeDetector');

  static getDetectorOf(target: any): ChangeDetector {
    return target[ChangeDetector.tag];
  }

  static setDetectorOf(target: any, detector: ChangeDetector): void {
    target[ChangeDetector.tag] = detector;
  }
}
