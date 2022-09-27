import { Injector } from '@homebots/injector';
import { getInputMetadata } from '../inputs';
import { ChangeDetector } from '../change-detection/change-detection';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';
import { CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { Dom } from '../dom/dom';

export class ChangeDetectionPlugin extends CustomElementPlugin {
  static readonly root: ChangeDetector = new ReactiveChangeDetector();

  onBeforeInit(element: CustomHTMLElement) {
    const detector = ChangeDetector.getDetectorOf(element);

    if (!detector) {
      this.createChangeDetector(element);
    }
  }

  onInit(element: CustomHTMLElement) {
    const detector = ChangeDetector.getDetectorOf(element);

    this.updateChangeDetector(element, detector);
    Dom.watchInputChanges(element, detector, getInputMetadata(element));

    detector.scheduleTreeCheck({ async: true });
  }

  onDestroy(element: CustomHTMLElement): void {
    ChangeDetector.getDetectorOf(element).detach();
  }

  protected findParentChangeDetector(element: CustomHTMLElement): ChangeDetector {
    if (element.parentComponent) {
      return ChangeDetector.getDetectorOf(element.parentComponent) || ChangeDetectionPlugin.root;
    }

    return ChangeDetectionPlugin.root;
  }

  protected createChangeDetector(element: CustomHTMLElement) {
    const injector = Injector.getInjectorOf(element) || Injector.global;
    const changeDetector = injector.get(ChangeDetector).fork();

    ChangeDetector.setDetectorOf(element, changeDetector);
    this.observeChanges(element, changeDetector);
  }

  protected observeChanges(element: CustomHTMLElement, changeDetector: ChangeDetector) {
    if (element.onBeforeCheck) {
      changeDetector.beforeCheck(() => element.onBeforeCheck());
    }
  }

  protected updateChangeDetector(element: CustomHTMLElement, changeDetector: ChangeDetector) {
    const parent = this.findParentChangeDetector(element);
    if (changeDetector.parent != parent) {
      changeDetector.detach();
      parent.attachToParent(changeDetector);
    }

    changeDetector.resume();
  }
}
