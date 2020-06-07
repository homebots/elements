export type AnyFunction = (...args: any[]) => any;

export function createTemplateFromHtml(html: string) {
  const templateRef = document.createElement('template');
  templateRef.innerHTML = html;

  return templateRef;
}

export const noop = () => {};

export type Fn = Function;
