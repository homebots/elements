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

  static isTemplateProxy(node?: Node): node is HTMLTemplateElementProxy {
    return node && node.nodeName === 'TEMPLATE' && (node as any).proxy;
  }

  static createTemplateFromHtml(html: string): HTMLTemplateElement {
    const templateRef = document.createElement('template');
    templateRef.innerHTML = html.trim();
    templateRef.normalize();

    return templateRef;
  }
}
