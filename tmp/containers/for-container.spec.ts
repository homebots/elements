import { Bootstrap } from '../index';
import { clearDom, createHtml, wait } from '../testing';

describe('repeatable template container (for)', () => {
  afterEach(() => clearDom());

  it('should repeat correctly the items in a template', async () => {
    const template = `
      <p>{{ this.items.length + ' items' }}</p>
      <ul>
        <template *for="'item'" [of]="this.items">
          <li>{{ item }}</li>
        </template>
      </ul>`;

    const rootNode = createHtml(template);
    rootNode.items = [1, 2, 3];

    const app = Bootstrap.createApplication(rootNode);
    app.check();
    await wait(10);

    expect(rootNode.querySelectorAll('li').length).toBe(3);
    expect(rootNode.innerText.trim()).toContain('3 items');

    rootNode.items = [5, 6];
    app.check();
    await wait(10);

    expect(rootNode.querySelectorAll('li').length).toBe(2);
    expect(rootNode.innerText.trim()).toContain('2 items');
  });
});
