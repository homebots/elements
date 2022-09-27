import { Bootstrap } from '../index';
import { createHtml, wait } from '../testing';

describe('toggle classes', () => {
  it('should toggle a css class based on a condition', async () => {
    const rootNode = createHtml(`<span [class.label]="this.isLabel">I'm a label!<span>`);

    const app = Bootstrap.createApplication(rootNode);
    const span = rootNode.querySelector('span');

    rootNode.isLabel = false;
    app.check();
    await wait();
    expect(span.classList.contains('label')).toBe(false);

    rootNode.isLabel = true;
    app.check();
    await wait();
    expect(span.classList.contains('label')).toBe(true);
  });
});
