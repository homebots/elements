import { Injector } from '@homebots/injector';
import { getInputMetadata } from 'src/inputs';
import { CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { ChangeDetector, Changes } from '../change-detection/change-detection';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';

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
    this.attachInputWatchers(element, detector);

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

  protected attachInputWatchers(element: CustomHTMLElement, changeDetector: ChangeDetector) {
    const inputs = getInputMetadata(element);
    if (!inputs.length || !element.onChanges) {
      return;
    }

    const inputNames = inputs.map((input) => input.property);
    let changes;

    changeDetector.beforeCheck(() => {
      changes = {};
    });

    for (const input of inputNames) {
      changeDetector.watch({
        expression() {
          return element[input];
        },

        callback(value, lastValue, firstTime) {

        }
      })
    }

    changeDetector.afterCheck((changes: Changes) => {
      console.log(Array.from(changes.entries()));
    });

    // changeDetector.afterCheck((changes: Changes) => {
    //   console.log('new changes', changes, changeDetector.id, changeDetector.parent.id);

    //   if (!changes.size) {
    //     return;
    //   }

    //   const inputChanges = new Changes();
    //   inputNames.forEach((input) => {
    //     if (changes.has(input)) {
    //       inputChanges.set(input, changes.get(input));
    //     }
    //   });

    //   if (inputChanges.size) {
    //     element.onChanges(changes);
    //   }
    // });
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
