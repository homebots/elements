export interface Change<T> {
  value: T;
  lastValue: T | undefined;
  firstTime?: boolean;
}

export type Changes = Record<string, Change<any>>;
export type ChangesCallback = (changes: Changes) => void;

export interface OnChanges {
  onChanges: ChangesCallback;
}
