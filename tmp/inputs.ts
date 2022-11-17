/// <reference types="reflect-metadata" />

export const INPUTS_METADATA = 'inputs';

export interface InputOptions {
  useEquals: boolean;
}

export interface InputWatcher {
  property: string;
  options: InputOptions;
}

export function getInputMetadata(customElement: any): InputWatcher[] {
  return Reflect.getMetadata(INPUTS_METADATA, customElement) || [];
}
