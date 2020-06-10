export type AnyFunction = (...args: any[]) => any;

export function createTemplateFromHtml(html: string) {
  const templateRef = document.createElement('template');
  templateRef.innerHTML = html;
  templateRef.normalize();

  return templateRef;
}

export const noop = () => {};
export type Fn = Function;
export const setTimeoutNative: Window['setTimeout'] = (...args) => ((window as any).__zone_symbol__setTimeout || window.setTimeout)(...args);
