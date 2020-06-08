import { ChangeDetector } from '../change-detection';
import { compileTree } from '../compile-tree';
import { ExecutionContext } from '../execution-context';
import { Input } from '../inputs';
import { setTimeoutNative } from '../utils';

export class IfContainer {
  @Input() if: boolean;
  @Input() else: HTMLTemplateElement;

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
    }
  }

  private createNodes(template: HTMLTemplateElement) {
    const templateNodes = Array.from(template.content.childNodes);
    const fragment = document.createDocumentFragment();
    const nodes = templateNodes.map(n => n.cloneNode(true));
    this.nodes = nodes;

    fragment.append(...nodes);
    nodes.forEach(node => compileTree(node as HTMLElement, this.changeDetector, this.executionContext));

    setTimeoutNative(() => {
      this.changeDetector.markForCheck();
      this.changeDetector.scheduleCheck();
    });

    setTimeoutNative(() => this.template.parentNode.appendChild(fragment), 5);
  }

  private removeNodes() {
    this.nodes.forEach(node => node.parentNode.removeChild(node));
    this.nodes = [];
  }
}
