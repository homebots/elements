import { Dom } from './dom';

describe('Dom Utilities', () => {
  it('should check different types of nodes', () => {
    expect(Dom.isDocumentFragment(document.createDocumentFragment())).toBe(true);
    expect(Dom.isTextNode(document.createTextNode('text'))).toBe(true);
    expect(Dom.isTemplateNode(document.createElement('template'))).toBe(true);
    expect(Dom.isElementNode(document.createElement('div'))).toBe(true);
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
