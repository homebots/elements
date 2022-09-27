import { Injector } from '@homebots/injector';
import { getInputMetadata } from 'src/inputs';
import { CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { ChangeDetector } from '../change-detection/change-detection';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';
import { Changes } from '../change-detection/observer';

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
    ChangeDetectionPlugin.attachInputWatchers(element, detector);

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

  static attachInputWatchers(element: CustomHTMLElement, changeDetector: ChangeDetector) {
    const inputs = getInputMetadata(element);
    if (!inputs.length || !element.onChanges) {
      return;
    }

    const inputNames = inputs.map((input) => input.property);
    let changes: Changes;
    let count: number;

    changeDetector.beforeCheck(() => {
      changes = {};
      count = 0;
    });

    for (const input of inputNames) {
      changeDetector.watch({
        expression() {
          return element[input];
        },

        callback(value, lastValue, firstTime) {
          changes[input] = { value, lastValue, firstTime };
          count++;
        },
      });
    }

    changeDetector.afterCheck(() => {
      count && element.onChanges(changes);
    });
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
