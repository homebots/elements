import { InjectionToken } from '@homebots/injector';
import { AnyFunction } from '../utils';

export type ChangeCallback<T> = (newValue: T, oldValue: T | undefined) => void;
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

export interface Watcher {
  expression: AnyFunction;
  callback?: ChangeCallback<unknown>;
  lastValue?: any;
  useEquals?: boolean;
  property?: string;
  firstTime?: boolean;
}

export const ChangeDetectorRef = new InjectionToken<ChangeDetector>('ChangeDetector');

export interface ChangeDetector {
  id?: string;
  parent?: ChangeDetector;

  beforeCheck(fn: AnyFunction): void;
  afterCheck(fn: AnyFunction): void;

  markAsDirtyAndCheck(): Promise<void>;
  markTreeForCheck(): void;
  scheduleTreeCheck(options?: { async: boolean }): void;
  check(): void;
  checkTree(): void;
  unregister(): void;
  watch<T>(expression: Watcher | Expression<T>): void;
  watch<T>(expression: Expression<T>, callback: ChangeCallback<T>, useEquals?: boolean): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  fork(target?: any): ChangeDetector;
}
