export function createAndInjectHtml(html) {
  const div = document.createElement('div');

  div.innerHTML = html;
  document.body.appendChild(div);

  return div;
}

export async  function wait(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}