import { HTMLTemplateElementProxy } from './template-proxy';

export class Dom {
  static setProperty(element: HTMLElement, property: string, value: any) {
    if (Dom.isTemplateProxy(element)) {
      element.proxy.setProperty(property, value);

      return;
    }

    element[property] = value;
  }

  static isTemplateNode(node?: Node): node is HTMLTemplateElement {
    return node && node.nodeName === 'TEMPLATE';
  }

  static isTextNode(node?: Node): node is Text {
    return node && node.nodeType === node.TEXT_NODE;
  }

  static isElementNode(node: any): node is HTMLElement {
    return node && node.nodeType === node.ELEMENT_NODE;
  }

  static isDocumentFragment(node: any): node is DocumentFragment {
    return node && node.nodeType === node.DOCUMENT_FRAGMENT_NODE;
  }

  static isTemplateProxy(node?: Node): node is HTMLTemplateElementProxy {
    return node && node.nodeName === 'TEMPLATE' && (node as any).proxy;
  }

  static createTemplateFromHtml(html: string): HTMLTemplateElement {
    const templateRef = document.createElement('template');
    templateRef.innerHTML = html.trim();
    templateRef.normalize();

    return templateRef;
  }

  static createTextPlaceholders(text: string) {
    const html = text.replace(/\{\{([\s\S]+?)}}/g, (_, inner) => `<span [innerhtml]="${inner.trim()}"></span>`);

    const div = document.createElement('div');
    const fragment = document.createDocumentFragment();
    div.innerHTML = html;
    fragment.append(...Array.from(div.childNodes));

    return fragment;
  }
}
