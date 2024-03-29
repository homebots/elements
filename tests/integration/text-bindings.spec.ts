import { Bootstrap } from '../../src/index';
import { clearDom, createHtml, wait } from '../../src/testing';

describe('template containers (if/for)', () => {
  afterEach(() => clearDom());

  it('should repeat correctly the items in a template', async () => {
    const template = `<p>Say {{ this.greeting  }}</p>`;
    const rootNode = createHtml(template);
    rootNode.greeting = 'hello';

    const app = Bootstrap.createApplication(rootNode);
    app.check();
    await wait();

    expect(rootNode.innerText.trim()).toBe('Say hello');

    rootNode.greeting = 'goodbye';
    app.check();
    await wait();

    expect(rootNode.innerText.trim()).toBe('Say goodbye');
  });
});
