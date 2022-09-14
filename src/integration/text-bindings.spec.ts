import { Bootstrap } from '../';
import { clearDom, createAndInjectHtml, wait } from './helpers';

describe('template containers (if/for)', () => {
  afterEach(() => clearDom());

  it('should repeat correctly the items in a template', async () => {
    const template = `<p>{{ greeting  }}</p>`;
    const rootNode = createAndInjectHtml(template);
    rootNode.greeting = 'hello';

    const app = Bootstrap.createApplication({ rootNode });
    app.check();
    await wait();

    expect(rootNode.innerText.trim()).toContain('hello');

    rootNode.greeting = 'goodbye';
    app.check();
    await wait();

    expect(rootNode.innerText.trim()).toContain('goodbye');
  });
});