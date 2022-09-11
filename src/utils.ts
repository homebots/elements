export const noop = () => {};
export type AnyFunction = (...args: any[]) => any;
export type Fn = Function;

// istanbul ignore next
export const setTimeoutNative: Window['setTimeout'] = (...args) =>
  ((window as any).__zone_symbol__setTimeout || window.setTimeout)(...args);

// Thanks @stimulus:
// https://github.com/stimulusjs/stimulus/blob/master/packages/%40stimulus/core/src/application.ts
export function domReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve(undefined);
    }
  });
}
