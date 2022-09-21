export function html(text: string) {
  const div = document.createElement('div');
  div.innerHTML = text;

  return div;
}

const nodesToCleanUp: HTMLElement[] = [];

export function createHtml(htmlString: string) {
  const div = html(htmlString);
  document.body.appendChild(div);
  nodesToCleanUp.push(div);

  return div as HTMLDivElement & { [k: string]: any };
}

export function createElement(tag: string) {
  const element = document.createElement(tag);
  document.body.appendChild(element);
  nodesToCleanUp.push(element);

  return element as HTMLDivElement & { [k: string]: any };
}

export function clearDom() {
  nodesToCleanUp.forEach((node) => node.remove());
  nodesToCleanUp.length = 0;
}

export async function wait(ms: number = 10) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
