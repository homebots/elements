import { noop, createTemplateFromHtml } from '../src/utils';

describe('utilities', () => {
  it('should create a template from a string', () => {
    const string = '  <div>text</div>   ';
    const template = createTemplateFromHtml(string);

    expect(template.tagName).toBe('TEMPLATE');
    expect(template.content.childNodes.length).toBe(1);
  });

  it('exports a noop', () => {
    expect(noop()).toBe(undefined);
  });
});
