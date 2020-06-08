import { ChangeDetector, ChangeDetectorRef } from './change-detection';
import { OnChanges, CustomElement } from './component';
import { getInjectorFrom } from './injector';

export const INPUTS_METADATA = 'inputs';

export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime: boolean;
}

export interface Changes {
  [property: string]: Change<unknown>;
}

export interface InputOptions {
  useEquals: boolean;
}

export interface InputWatcher {
  property: string;
  options?: InputOptions;
}

export function addInputWatchers(customElement: CustomElement, changeDetector: ChangeDetector) {
  const inputs: InputWatcher[] = Reflect.getMetadata(INPUTS_METADATA, customElement) || [];

  if (!inputs.length) return;

  let changes: Changes = {};
  let firstTime = true;
  let hasChanges = false;

  inputs.forEach(input => {
    changeDetector.watch(
      () => customElement[input.property],
      (value, lastValue) => {
        hasChanges = true;
        changes[input.property] = {
          value,
          lastValue,
          firstTime,
        };
      },
      input.options?.useEquals,
    );
  });

  changeDetector.afterCheck(() => {
    if (!hasChanges) return;

    customElement.onChanges(changes);
    firstTime = false;
    changes = {};
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

