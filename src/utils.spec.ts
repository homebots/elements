import { noop, Dom } from '.';

describe('utilities', () => {
  it('should create a template from a string', () => {
    const string = '  <div>text</div>   ';
    const template = Dom.createTemplateFromHtml(string);

    expect(template.tagName).toBe('TEMPLATE');
    expect(template.content.childNodes.length).toBe(1);
  });

  it('exports a noop', () => {
    expect(noop()).toBe(undefined);
  });
});
