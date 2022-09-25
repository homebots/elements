import { Bootstrap } from '../../src/index';
import { clearDom, createHtml, wait } from '../../src/testing';

describe('template containers (if/for)', () => {
  afterEach(() => clearDom());

  it('should repeat correctly the items in a template', async () => {
    const template = `
      <ul>
        <p>{{ this.items.length + ' items' }}</p>
        <template *for="'item'" [of]="this.items">
          <li>{{ item }}</li>
        </template>
      </ul>`;

    const rootNode = createHtml(template);
    rootNode.items = [1, 2, 3];

    const app = Bootstrap.createApplication(rootNode);
    app.check();
    await wait();

    expect(rootNode.querySelectorAll('li').length).toBe(3);
    expect(rootNode.innerText.trim()).toContain('3 items');

    rootNode.items = [5, 6];
    app.check();
    await wait();

    expect(rootNode.querySelectorAll('li').length).toBe(2);
    expect(rootNode.innerText.trim()).toContain('2 items');
  });

  it('should add/remove an item from DOM based on a condition', async () => {
    const condition = { value: false };
    const rootNode = createHtml(
      `<template *if="this.condition.value" [else]="ola">
        <p>Hello!</p>
      </template>
      <template #ola><div>Ola!</div></div>`,
    );

    const app = Bootstrap.createApplication(rootNode);
    rootNode.condition = condition;
    app.check();
    await wait();

    expect(rootNode.innerText.trim()).toBe('Ola!');
    condition.value = true;
    app.check();
    await wait();

    expect(rootNode.querySelector('p')).not.toBe(null);
    expect(rootNode.innerText.trim()).toBe('Hello!');
  });

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
