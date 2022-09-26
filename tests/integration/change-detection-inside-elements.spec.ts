import { Bootstrap, CustomElement, Input } from '../../src';
import { createHtml } from '../../src/testing';

describe('change detection', () => {
  fit('should watch changes inside a custom element', async () => {
    const template = `
    <div [class.bold]="this.properties.bold"></div>
    <p [title]="this.properties.title">{{ this.properties.content }}</p>
    <x-target [input1]="this.properties.input1"></x-target>
    `;
    const spy = jasmine.createSpy();
    const properties = {
      bold: true,
      title: 'text title',
      content: 'hello',
      input1: 'test',
    };

    class Test extends HTMLElement {
      @Input() input1: string;
      @Input() input2: string;
      onChanges(changes) {
        spy(changes);
      }
    }

    CustomElement.define(Test, { tag: 'x-target' });
    const root = createHtml(template);
    root.properties = properties;

    const app = Bootstrap.createApplication(root);
    const cd = app.changeDetector;

    expect(cd).not.toBeUndefined();
    cd.detectChanges();

    const target = root.querySelector('x-target') as any;

    expect(root.querySelector('div')?.className).toBe('bold');
    expect(root.querySelector('p')?.title).toBe(properties.title);
    expect(root.textContent?.trim()).toBe(properties.content);
    expect(target.input1).toBe('test');
    expect(target.onChanges).toHaveBeenCalledWith({ input1: { firstTime: true, value: 'test', lastValue: undefined } });
  });
});
