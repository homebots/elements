import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { setTimeoutNative } from '../utils';
import { Inject } from '@homebots/injector';
import { DomScanner } from '../dom/dom-scanner';

const IF = 0;
const ELSE = 1;
const NONE = 2;

export class IfContainer {
  @Inject() dom: DomScanner;
  if: boolean;
  else: HTMLTemplateElement;

  constructor(
    private template: HTMLTemplateElement,
    private changeDetector: ChangeDetector,
    private executionContext: ExecutionContext,
  ) {}

  private nodes: Node[] = [];
  private state: 0 | 1 | 2;

  onChanges() {
    switch (true) {
      case this.if && this.state !== IF:
        this.createNodes(this.template);
        this.state = IF;
        break;

      case !this.if && this.else && this.state !== ELSE:
        this.createNodes(this.else);
        this.state = ELSE;
        break;

      case !this.if && !this.else:
        this.removeOldNodes();
        this.state = NONE;
        break;
    }
  }

  private createNodes(template: HTMLTemplateElement) {
    const templateNodes = Array.from(template.content.childNodes);
    const fragment = document.createDocumentFragment();
    const nodes = templateNodes.map((n) => n.cloneNode(true));
    const changeDetector = this.changeDetector.parent;

    fragment.append(...nodes);
    nodes.forEach((node) => this.dom.scanTree(node as HTMLElement, changeDetector, this.executionContext));

    this.changeDetector.markAsDirtyAndCheck();

    setTimeoutNative(() => {
      template.parentNode.insertBefore(fragment, this.template);
      this.removeOldNodes();
      this.nodes = nodes;
    }, 2);
  }

  private removeOldNodes() {
    this.nodes.forEach((node) => node.parentNode.removeChild(node));
    this.nodes = [];
  }
}
