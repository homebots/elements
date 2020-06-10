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

