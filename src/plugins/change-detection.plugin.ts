import { Injector } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { Dom } from '../dom/dom';
import { getInputMetadata } from '../inputs';

let root: ChangeDetector;

export class ChangeDetectionPlugin extends CustomElementPlugin {
  static get root(): ChangeDetector {
    return root || (root = Injector.global.get(ChangeDetector));
  }

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

    detector.detectChanges({ async: true });
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
      parent.adopt(changeDetector);
    }
  }
}
