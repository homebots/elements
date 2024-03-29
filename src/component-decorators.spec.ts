import { Child, Children, Component, CustomElement, DomEventEmitter, domReady, Input, Output } from '.';
import { INPUTS_METADATA } from './inputs';

describe('decorators', () => {
  it('should have decorators to find child nodes inside a component', () => {
    class ChildAndChildrenOfElement {
      @Child('.child') child;
      @Children('.children') children;

      querySelector = jasmine.createSpy('').and.returnValue(null);
      querySelectorAll = jasmine.createSpy('').and.returnValue(null);
    }

    const children = new ChildAndChildrenOfElement();

    expect(children.child).toBeNull();
    expect(children.children).toBeNull();
    expect(children.querySelector).toHaveBeenCalledWith('.child');
    expect(children.querySelectorAll).toHaveBeenCalledWith('.children');
  });

  it('should have decorator to create a component', async () => {
    expect(typeof Component === 'function').toBe(true);
    const spy = spyOn(CustomElement, 'define').and.callThrough();
    const tagName = `x-test${Math.random()}`;

    @Component({ template: `<span>test</span>`, tag: tagName })
    class TestComponent extends HTMLElement {}

    await domReady();

    expect(typeof TestComponent).toBe('function');
    expect(spy).toHaveBeenCalled();
  });

  it('should have decorators for inputs and outputs', () => {
    class InputOutput {
      @Input() input: string;
      @Output('text') ontext: DomEventEmitter<string>;
    }

    const el = new InputOutput();
    const meta = Reflect.getMetadata(INPUTS_METADATA, el);

    expect(meta).toEqual([{ property: 'input', options: { useEquals: false } }]);
    expect(el.ontext instanceof DomEventEmitter).toBe(true);
  });
});
