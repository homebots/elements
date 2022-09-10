import { Component, Bootstrap } from '../';
import { createAndInjectHtml, wait } from './helpers';

describe('a list of items with for-of', () => {
  const template = `<template *for="'item'" of="this.list"><li [innerText]="item.name"></li></template>`;

  @Component({ tag: 'x-list', template })
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
    const html = `<x-list></x-list>`;
    const node = createAndInjectHtml(html);
    Bootstrap.createApplication({ rootNode: node });
    const list = node.firstChild;
    expect(list).not.toBe(undefined);

    await wait(10);
    console.log(list);
  });
});
