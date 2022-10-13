import { Bootstrap, ChangeDetectionPlugin, ChangeDetector, CustomElement, Input } from '../../src';
import { createHtml, wait } from '../../src/testing';

describe('change detector in multiple levels', () => {
  it('should connect child nodes with parents', async () => {
    const shadowDom = true;
    const values = {};

    class TestComponent extends HTMLElement {
      @Input() uid = 1;

      onChanges() {
        values[this.nodeName] = this.uid;
      }
    }

    CustomElement.define(TestComponent, {
      tag: 'x-outer',
      shadowDom,
      template: `
      <div [id]="this.uid">
        <x-inner [uid]="this.uid + 1"></x-inner>
      </div>`,
    });

    CustomElement.define(TestComponent, {
      tag: 'x-inner',
      shadowDom,
      template: '<span title="this.uid">{{ this.uid }}</span>',
    });

    CustomElement.define(TestComponent, {
      tag: 'x-app',
      shadowDom,
      template: `
      <x-outer [uid]="this.uid + 1"></x-outer>
      `,
    });

    const template = `<x-app [uid]="this.uid"></x-app>`;
    const root = createHtml(template);
    const app = Bootstrap.createApplication(root);
    root.uid = 5;

    await app.check();
    await wait(10);

    root.uid = 10;
    await app.check();
    await wait(10);

    expect(values).toEqual({ 'X-APP': 10, 'X-OUTER': 11, 'X-INNER': 12 });
  });
});
