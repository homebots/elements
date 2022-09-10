import { CustomElement, Bootstrap } from '../';
import { createAndInjectHtml, wait } from './helpers';

describe('a list of items with for-of', () => {
  const template = `<template *for="'item'" of="this.list"><li [innerText]="item.name"></li></template>`;

  // @Component({ tag: 'x-list', template })
  class ListComponent extends HTMLElement {
    list = [
      {
        name: 'Alice',
      },
      {
        name: 'Bob',
      },
    ];

    addItem() {
      this.list = [...this.list, { name: 'Paul' }];
    }
  }

  it('should repeat correctly the items in a template', async () => {
    const rootNode = createAndInjectHtml(`<x-list></x-list>`);
    const app = Bootstrap.createApplication({ rootNode });

    CustomElement.define(ListComponent, { tag: 'x-list', template });
    await wait(10);

    const list = rootNode.firstChild;
    expect(list).not.toBe(undefined);

    console.log(list, app);
  });
});
