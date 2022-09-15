import { HTMLTemplateElementProxy, TemplateProxy } from './template-proxy';

export class Dom {
  static setProperty(element: HTMLElement, property: string, value: any) {
    if (Dom.isTemplateProxy(element)) {
      element.proxy.setProperty(property, value);

      return;
    }

    element[property] = value;
  }

  static isTemplateNode(node?: Node): node is HTMLTemplateElement {
    return Boolean(node && node.nodeName === 'TEMPLATE');
  }

  static isTextNode(node?: Node): node is Text {
    return Boolean(node && node.nodeType === node.TEXT_NODE);
  }

  static isElementNode(node: any): node is HTMLElement {
    return Boolean(node && node.nodeType === node.ELEMENT_NODE);
  }

  static isDocumentFragment(node: any): node is DocumentFragment {
    return Boolean(node && node.nodeType === node.DOCUMENT_FRAGMENT_NODE);
  }

  static isTemplateProxy(node?: Node): node is HTMLTemplateElementProxy {
    return Boolean(node && node.nodeName === 'TEMPLATE' && (node as any).proxy);
  }

  static attachProxy(element: Node) {
    const proxy = new TemplateProxy();
    (element as HTMLTemplateElementProxy).proxy = proxy;

    return proxy;
  }

  static createTemplateFromHtml(html: string): HTMLTemplateElement {
    const templateRef = document.createElement('template');
    templateRef.innerHTML = html.trim();
    templateRef.normalize();

    return templateRef;
  }

  static createTextPlaceholders(text: string): string {
    return '`' + text.replace(/\{\{([\s\S]+?)}}/g, (_, inner) => '${ ' + inner.trim() + ' }') + '`';
  }
}
