import { html } from '../testing';
import { Dom } from './dom';
import { TemplateProxy } from './template-proxy';

describe('Dom Utilities', () => {
  it('should set a property in a given element', () => {
    const element = html('');
    const property = 'innerText';
    const value = 'hello!';

    Dom.setProperty(element, property, value);

    expect(element.textContent).toBe(value);
  });

  it('should set a property in a proxy attached to an element', () => {
    const element = document.createElement('template');
    const property = 'innerText';
    const value = 'hello!';
    const proxy = Dom.attachProxy(element);
    const target = { innerText: '', onChanges() {} };

    proxy.setTarget(target);
    Dom.setProperty(element, property, value);

    expect(element.innerText).toBe('');
    expect(target.innerText).toBe(value);
  });

  it('should check different types of nodes', () => {
    const template = document.createElement('template');
    Dom.attachProxy(template);

    expect(Dom.isDocumentFragment(document.createDocumentFragment())).toBe(true);
    expect(Dom.isTextNode(document.createTextNode('template'))).toBe(true);
    expect(Dom.isTemplateNode(template)).toBe(true);
    expect(Dom.isTemplateProxy(template)).toBe(true);
    expect(Dom.isElementNode(document.createElement('div'))).toBe(true);
  });

  it('should create a proxy target in an element', () => {
    const element = document.createElement('template');
    const proxy = Dom.attachProxy(element);

    expect(proxy instanceof TemplateProxy).toBe(true);
    expect((element as any).proxy).toBe(proxy);
  });

  it('should create a template from a string', () => {
    const string = '  <div>text</div>   ';
    const template = Dom.createTemplateFromHtml(string);

    expect(template.tagName).toBe('TEMPLATE');
    expect(template.content.childNodes.length).toBe(1);
    expect(template.content.childNodes[0].textContent).toBe('text');
  });

  describe('createTextPlaceholders', () => {
    it('should convert double brackets in a string into a string template with placeholders', () => {
      const textNode = document.createTextNode('one {{ two }} three {{ 4+5 }}');
      const output = Dom.createTextPlaceholders(textNode.textContent);

      expect(output).toBe('`one ${ two } three ${ 4+5 }`');
    });
  });
});
