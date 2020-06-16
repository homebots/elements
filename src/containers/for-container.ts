import { ChangeDetector, Changes } from '../change-detection';
import { ExecutionContext } from '../execution-context';
import { Input } from '../inputs';
import { Inject } from '../injector';
import { DomHelpers } from '../dom-helpers';

interface ContainerChild {
  executionContext: ExecutionContext;
  nodes: Node[];
  detached: boolean;
}

export class ForContainer {
  @Input() of: Iterable<any>;
  @Input() for: string;
  @Inject() dom: DomHelpers;

  private children: ContainerChild[] = [];

  constructor(
    private template: HTMLTemplateElement,
    private changeDetector: ChangeDetector,
    private executionContext: ExecutionContext,
  ) { }

  _templateNodes: Node[];

  get templateNodes() {
    if (!this._templateNodes) {
      this._templateNodes = Array.from(this.template.content.children);
    }

    return this._templateNodes;
  }

  onChanges(changes: Changes) {
    if (!this.of || !this.for) {
      this.removeAllChildren();
      return;
    }

    if (changes.for) {
      this.resetExecutionContext();
    }

    const items = Array.from(this.of);
    const fragment = document.createDocumentFragment();

    this.adjustChildrenLength(items.length);
    items.forEach((item, index) => {
      const child = this.children[index];
      const locals: any = {};

      locals[this.for] = item;
      locals.index = index;

      child.executionContext.addLocals(locals);

      if (child.detached) {
        fragment.append(...child.nodes);
        child.detached = false;
      }
    });

    this.changeDetector.markAsDirtyAndCheck();

    requestAnimationFrame(() => this.template.parentNode.appendChild(fragment));
  }

  private resetExecutionContext() {
    this.children.forEach(node => node.executionContext.reset());
  }

  private compileChild(child: ContainerChild) {
    child.nodes.forEach(node => this.dom.compileTree(node as HTMLElement, this.changeDetector, child.executionContext));
  }

  private createChild(): ContainerChild {
    const nodes = this.templateNodes.map(n => n.cloneNode(true));

    return {
      nodes,
      detached: true,
      executionContext: this.executionContext.fork(),
    };
  }

  private removeChild(child: ContainerChild) {
    child.nodes.forEach(node => node.parentNode.removeChild(node));
  }

  private removeAllChildren() {
    if (this.children.length) {
      this.children.forEach(node => this.removeChild(node));
      this.children = [];
    }
  }

  private adjustChildrenLength(length: number) {
    const children = this.children;

    if (children.length < length) {
      const newNodes = Array(length - children.length).fill(null).map(() => this.createChild());
      newNodes.forEach(node => this.compileChild(node));
      children.push(...newNodes);
      return;
    }

    if (children.length > length) {
      children.slice(length).forEach(node => this.removeChild(node));
      children.length = length;
    }
  }
}
