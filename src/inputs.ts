export const INPUTS_METADATA = 'inputs';

export interface InputOptions {
  useEquals: boolean;
}

export interface InputWatcher {
  property: string;
  options: InputOptions;
}

export function getInputMetadata(customElement: any): InputWatcher[] {
  if (customElement.getMetadata) {
    return customElement.getMetadata(INPUTS_METADATA);
  }

  return Reflect.getMetadata(INPUTS_METADATA, customElement) || [];
}
