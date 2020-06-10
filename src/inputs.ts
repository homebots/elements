import { ChangeDetector, ChangeDetectorRef, Changes } from './change-detection';
import { OnChanges, CustomElement } from './component';
import { getInjectorFrom } from './injector';

export const INPUTS_METADATA = 'inputs';

export interface InputOptions {
  useEquals: boolean;
}

export interface InputWatcher {
  property: string;
  options?: InputOptions;
}

export function getInputMetadata(customElement: any): InputWatcher[] {
  return Reflect.getMetadata(INPUTS_METADATA, customElement) || [];
}

export function addInputWatchers(customElement: object & OnChanges, changeDetector: ChangeDetector) {
  const inputs = getInputMetadata(customElement);

  if (!inputs.length) return;

  let inputChanges: Changes = {};
  let firstTime = true;
  let hasChanges = false;

  changeDetector.afterCheck((changes: Changes) => {
    inputs.forEach(input => {
      const change = changes[input.property];

      if (change) {
        hasChanges = true;
        inputChanges[input.property] = {
          value: change.value,
          lastValue: change.lastValue,
          firstTime,
        };
      }
    });

    if (!hasChanges) return;

    customElement.onChanges(changes);

    firstTime = false;
    inputChanges = {};
    hasChanges = false;
  });
}

export function Input(options?: InputOptions) {
  return (target: any, property: string) => {
    const inputs: InputWatcher[] = Reflect.getMetadata(INPUTS_METADATA, target) || [];
    inputs.push({
      property,
      options,
    });

    Reflect.defineMetadata(INPUTS_METADATA, inputs, target);
  };
}

