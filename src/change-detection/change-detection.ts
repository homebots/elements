import { ChangesCallback, IObserver } from './observer';


export interface OnChanges {
  onChanges: ChangesCallback;
}

export interface CheckOptions {
  async: boolean;
}

export interface ChangeDetector extends IObserver {
  readonly root: ChangeDetector;
  id?: string;
  parent?: ChangeDetector;
  children?: ChangeDetector[];

  markTreeForCheck(): void;
  scheduleTreeCheck(options?: CheckOptions): void;
  checkTree(): void;
  detectChanges(): Promise<void> | void;

  detach(): void;
  run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
  attachToParent(cd: ChangeDetector): void;
  fork(): ChangeDetector;
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
