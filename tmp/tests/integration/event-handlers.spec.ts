import { Bootstrap } from '../../src/index';
import { clearDom, createHtml, wait } from '../../src/testing';

describe('native and custom events', () => {
  afterEach(() => clearDom());

  it('should handle event once and detach handler', async () => {
    const template = `
      <span>{{ this.count + ' times' }}</span>
      <button (click.once)="this.count++">+</button>`;
    const rootNode = createHtml(template);
    const app = Bootstrap.createApplication(rootNode);

    rootNode.count = 0;
    await app.check();

    expect(rootNode.querySelector('span').innerText).toBe('0 times');

    rootNode.querySelector('button').click();
    await wait();

    expect(rootNode.querySelector('span').innerText).toBe('1 times');

    rootNode.querySelector('button').click();
    await wait();

    expect(rootNode.querySelector('span').innerText).toBe('1 times');
  });

  it('should handle event and stop default behaviour', async () => {
    const template = `
      <form (submit.stop)="this.lastEvent = $event">
        <button type="submit">ok</button>
      </form>`;

    const rootNode = createHtml(template);
    const app = Bootstrap.createApplication(rootNode);
    await app.check();
    rootNode.querySelector('button').click();

    expect(rootNode.lastEvent).not.toBe(undefined);
    expect(rootNode.lastEvent.defaultPrevented).toBe(true);
  });
});
