import { ChangesCallback, IObserver } from './observer';

export interface OnChanges {
  onChanges: ChangesCallback;
}

export interface CheckOptions {
  async: boolean;
}

export interface ChangeDetector extends IObserver {
  id: string;
  root: ChangeDetector;
  parent?: ChangeDetector;
  children?: ChangeDetector[];

  scheduleCheck(options?: CheckOptions): void;
  detectChanges(options?: CheckOptions): Promise<void> | void;
  detach(): void;
  adopt(cd: ChangeDetector): void;
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
