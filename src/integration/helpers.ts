const nodes: HTMLElement[] = [];

export function createAndInjectHtml(html) {
  const div = document.createElement('div');

  div.innerHTML = html;
  document.body.appendChild(div);

  nodes.push(div);

  return div as HTMLDivElement & { [k: string]: any };
}

export function clearDom() {
  nodes.forEach((node) => node.remove());
  nodes.length = 0;
}

export async function wait(ms: number = 10) {
  return await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, ms)));
}
