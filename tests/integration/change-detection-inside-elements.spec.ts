import { Bootstrap, CustomElement, Input } from '../../src';
import { createHtml, wait } from '../../src/testing';

describe('change detection', () => {
  it('should watch changes inside a custom element', async () => {
    const template = `
    <div [class.bold]="this.properties.bold"></div>
    <p [title]="this.properties.title">{{ this.properties.content }}</p>
    <x-target
      [input1]="this.properties.input1"
      [input2]="this.properties.input2"
      ></x-target>
    `;
    const spy = jasmine.createSpy();
    const properties = {
      bold: true,
      title: 'text title',
      content: 'hello',
      input1: 'test',
      input2: undefined,
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
    await cd.detectChanges();
    await wait(10);

    const target = root.querySelector('x-target') as any;

    expect(root.querySelector('div')?.className).toBe('bold');
    expect(root.querySelector('p')?.title).toBe(properties.title);
    expect(root.textContent?.trim()).toBe(properties.content);
    expect(target.input1).toBe('test');
    expect(spy).toHaveBeenCalledWith({ input1: { firstTime: true, value: 'test', lastValue: undefined } });

    Object.assign(properties, {
      input1: 'after changes',
      input2: 'new value',
    });
    spy.calls.reset();
    await cd.detectChanges();
    await wait(10);

    expect(spy).toHaveBeenCalledWith({
      input1: { firstTime: false, value: 'after changes', lastValue: 'test' },
      input2: { firstTime: true, value: 'new value', lastValue: undefined },
    });
  });
});
