import { Bootstrap } from '..';
import { clearDom, createAndInjectHtml, wait } from './helpers';

describe('native and custom events', () => {
  afterEach(() => clearDom());

  it('should handle event once and detach handler', async () => {
    const template = `
      <span [innerText]="this.count + ' times'"></span>
      <button (click.once)="this.count++">+</button>`;
    const rootNode = createAndInjectHtml(template);
    const app = Bootstrap.createApplication({ rootNode });

    rootNode.count = 0;
    app.check();
    await wait();

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

    const rootNode = createAndInjectHtml(template);
    const app = Bootstrap.createApplication({ rootNode });
    app.check();
    await wait();
    rootNode.querySelector('button').click();

    expect(rootNode.lastEvent).not.toBe(undefined);
    expect(rootNode.lastEvent.defaultPrevented).toBe(true);
  });
});
