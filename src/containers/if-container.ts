import { ChangeDetector } from '../change-detection';
import { ExecutionContext } from '../execution-context';
import { Input } from '../inputs';
import { setTimeoutNative } from '../utils';
import { Inject } from '../injector';
import { DomHelpers } from '../dom-helpers';

const IF = 0;
const ELSE = 1;
const NONE = 2;

export class IfContainer {
  @Input() if: boolean;
  @Input() else: HTMLTemplateElement;
  @Inject() dom: DomHelpers;

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

    fragment.append(...nodes);
    nodes.forEach((node) => this.dom.compileTree(node as HTMLElement, this.changeDetector, this.executionContext));

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
