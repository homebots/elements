import { Child, Children, Component } from '..';
import { defaults } from './custom-element';

describe('decorators', () => {
  it('should have decorators to find child nodes inside a component', () => {
    class ChildAndChildrenOfElement extends HTMLElement {
      @Child('.child') childNode: Node;
      @Children('.children') childNodeList: Node[];

      querySelector = jasmine.createSpy('').and.returnValue(null);
      querySelectorAll = jasmine.createSpy('').and.returnValue(null);
    }

    const tagName = 'child-children';

    defaults.define(ChildAndChildrenOfElement, { tag: tagName });
    const children = defaults.createElement(ChildAndChildrenOfElement);

    expect(children.childNode).toBeNull();
    expect(children.childNodeList).toBeNull();
    expect(children.querySelector).toHaveBeenCalledWith('.child');
    expect(children.querySelectorAll).toHaveBeenCalledWith('.children');
  });

  it('should have decorator to create a component', async () => {
    expect(typeof Component === 'function').toBe(true);
    const tagName = `x-test${Math.random()}`;

    @Component({ template: `<span>test</span>`, tag: tagName })
    class TestComponent extends HTMLElement {}

    expect(typeof TestComponent).toBe('function');
    expect(customElements.get(tagName)).not.toBeFalsy();
  });

  /*it('should have decorators for inputs and outputs', () => {
    class InputOutput {
      @Input() input: string;
      @Output('text') ontext: DomEventEmitter<string>;
    }

    const el = new InputOutput();
    const meta = Reflect.getMetadata(INPUTS_METADATA, el);

    expect(meta).toEqual([{ property: 'input', options: { useEquals: false } }]);
    expect(el.ontext instanceof DomEventEmitter).toBe(true);
  });*/
});
