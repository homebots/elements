import { CustomElementPlugin, CustomHTMLElement, LifecycleHook } from '../component';
import { ChangeDetector, OnChanges } from './change-detection';
import { ReactiveChangeDetector } from './reactive-change-detector';

export interface OnBeforeCheck extends OnChanges {
  onBeforeCheck?: LifecycleHook;
}

export class ChangeDetectionPlugin extends CustomElementPlugin {
  static readonly root: ChangeDetector = new ReactiveChangeDetector(null, null);

  onCreate(element: CustomHTMLElement): void {
    this.createChangeDetector(element as CustomHTMLElement & OnBeforeCheck);
  }

  onInit(element: CustomHTMLElement) {
    ChangeDetector.getDetectorOf(element).markAsDirtyAndCheck();
  }

  onDestroy(element: CustomHTMLElement): void {
    ChangeDetector.getDetectorOf(element).unregister();
  }

  protected findParentChangeDetector(element: CustomHTMLElement): ChangeDetector {
    if (element.parentComponent) {
      return ChangeDetector.getDetectorOf(element.parentComponent) || ChangeDetectionPlugin.root;
    }

    return ChangeDetectionPlugin.root;
  }

  protected createChangeDetector<T extends CustomHTMLElement>(element: T & OnBeforeCheck) {
    const parent = this.findParentChangeDetector(element);
    const changeDetector = parent.fork(element);

    ChangeDetector.setDetectorOf(element, changeDetector);

    if (element.onBeforeCheck) {
      changeDetector.beforeCheck(() => element.onBeforeCheck());
    }

    if (element.onChanges) {
      changeDetector.afterCheck((changes: Map<any, any>) => changes.size && element.onChanges(changes));
    }
  }
}
