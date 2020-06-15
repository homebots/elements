import { ChangeDetector } from '../change-detection';
import { ExecutionContext } from '../execution-context';
import { Input } from '../inputs';
import { setTimeoutNative } from '../utils';
import { Inject } from '../injector';
import { DomHelpers } from '../dom-helpers';

export class ForContainer {
  @Input() of: Iterable<any>;
  @Input() for: string;
  @Inject() dom: DomHelpers;

  private nodes: Node[] = [];

  constructor(
    private template: HTMLTemplateElement,
    private changeDetector: ChangeDetector,
    private executionContext: ExecutionContext,
  ) { }

  onChanges() {
    if (!this.of || !this.for) {
      return;
    }

    const items = Array.from(this.of);
    const changeDetector = this.changeDetector;
    const templateNodes = Array.from(this.template.content.children);
    const fragment = document.createDocumentFragment();
    const allNodes = [];

    const children = items.map((item, index) => {
      const context = this.executionContext.fork();
      const nodes = templateNodes.map(n => n.cloneNode(true));

      allNodes.push(...nodes);
      context.addLocals({ [this.for]: item, index });
      fragment.append(...nodes);

      return { nodes, context };
    });

    children.forEach((o) => o.nodes.forEach(node => this.dom.compileTree(node as HTMLElement, changeDetector, o.context)));
    changeDetector.markAsDirtyAndCheck();

    setTimeoutNative(() => {
      this.removeNodes();
      this.nodes = allNodes;
      this.template.parentNode.appendChild(fragment);
    }, 2);
  }

  private removeNodes() {
    this.nodes.forEach(node => node.parentNode.removeChild(node));
    this.nodes = [];
  }
}
