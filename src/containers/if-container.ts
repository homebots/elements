import { ChangeDetector } from '../change-detection';
import { ExecutionContext } from '../execution-context';
import { Input } from '../inputs';
import { setTimeoutNative } from '../utils';
import { Inject } from '../injector';
import { DomHelpers } from '../dom-helpers';

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

  onChanges() {
    this.removeNodes();

    if (this.if) {
      this.createNodes(this.template);
    } else if (this.else) {
      this.createNodes(this.else);
    } else {
      this.removeNodes();
    }
  }

  private createNodes(template: HTMLTemplateElement) {
    const templateNodes = Array.from(template.content.childNodes);
    const fragment = document.createDocumentFragment();
    const nodes = templateNodes.map(n => n.cloneNode(true));

    fragment.append(...nodes);
    nodes.forEach(node => this.dom.compileTree(node as HTMLElement, this.changeDetector, this.executionContext));

    this.changeDetector.markForCheck();
    this.changeDetector.scheduleCheck();

    setTimeoutNative(() => {
      this.template.parentNode.appendChild(fragment);
      this.removeNodes();
      this.nodes = nodes;
    }, 2);
  }

  private removeNodes() {
    this.nodes.forEach(node => node.parentNode.removeChild(node));
    this.nodes = [];
  }
}
