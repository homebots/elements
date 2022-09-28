import { InputWatcher } from '../inputs';
import { ChangeDetector, OnChanges } from '../change-detection/change-detection';
import { Changes } from '../change-detection/observer';

export class Dom {
  static isTemplateNode(node?: Node): node is HTMLTemplateElement & { proxy?: any } {
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

  static createTemplateFromHtml(html: string): HTMLTemplateElement {
    const templateRef = document.createElement('template');
    templateRef.innerHTML = html.trim();
    templateRef.normalize();

    return templateRef;
  }

  static createTextPlaceholders(text: string): string {
    return '`' + text.replace(/\{\{([\s\S]+?)}}/g, (_, inner) => '${ ' + inner.trim() + ' }') + '`';
  }

  static watchInputChanges(element: HTMLElement, changeDetector: ChangeDetector, inputs: InputWatcher[]) {
    if (!inputs.length || !(element as any).onChanges) {
      return;
    }

    const inputNames = inputs.map((input) => input.property);
    let changes: Changes;
    let count: number;

    changeDetector.beforeCheck(() => {
      changes = {};
      count = 0;
    });

    for (const input of inputNames) {
      changeDetector.watch({
        expression() {
          return element[input];
        },

        callback(value, lastValue, firstTime) {
          changes[input] = { value, lastValue, firstTime };
          count++;
        },
      });
    }

    changeDetector.afterCheck(() => {
      count && (element as HTMLElement & OnChanges).onChanges(changes);
    });
  }

  static normalizeTemplate(template: HTMLTemplateElement) {
    const fn = (child: Node) => {
      child.normalize();
      child.childNodes.forEach(fn);
    }

    fn(template.content);
  }
}
