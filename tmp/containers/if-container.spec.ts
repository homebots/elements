import { Bootstrap } from '../index';
import { clearDom, createHtml, wait } from '../testing';

describe('conditional template containr (if)', () => {
  afterEach(() => clearDom());

  it('should add/remove an item from DOM based on a condition', async () => {
    const condition = { value: false };
    const rootNode = createHtml(
      `<template container="if" [if]="this.condition.value" [else]="ola">
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
});
