import { Component, Child, Children, Input, Output } from './';
beforeAll(() => console.log('\x1Bc'));
describe('public API', () => {
  it('should have decorators', () => {
    expect([Component, Child, Children, Input, Output].every((f) => typeof f === 'function')).toBe(true);
    class ChildAndChildrenOfElement {
      @Child('.child') child;
      @Child('.children') children;

      querySelector = jasmine.createSpy('').and.returnValue(null);
    }

    const children = new ChildAndChildrenOfElement();

    expect(children.child).toBeNull();
    expect(children.children).toBeNull();
    expect(children.querySelector).toHaveBeenCalledTimes(2);
    expect(children.querySelector).toHaveBeenCalledWith('.child');
    expect(children.querySelector).toHaveBeenCalledWith('.children');
  });
});
