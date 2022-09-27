import { ChangeDetector } from '../change-detection/change-detection';
import { ExecutionContext } from '../execution-context';
import { Inject } from '@homebots/injector';
import { DomScanner } from '../dom/dom-scanner';
import { setTimeoutNative } from '../utils';
import { Changes } from '../change-detection/observer';

interface ContainerChild {
  executionContext: ExecutionContext;
  changeDetector: ChangeDetector;
  nodes: Node[];
  detached: boolean;
}

export class ForContainer {
  @Inject() dom: DomScanner;
  of: Iterable<any>;
  for: string;

  private children: ContainerChild[] = [];

  constructor(
    private template: HTMLTemplateElement & { anchor?: Comment },
    private changeDetector: ChangeDetector,
    private executionContext: ExecutionContext,
  ) {}

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

    const items = this.getArrayOfItems();
    const fragment = document.createDocumentFragment();

    this.adjustChildrenLength(items.length);
    this.prepareLocalsAndChildren(items, fragment);
    this.changeDetector.detectChanges();

    setTimeoutNative(() => this.template.anchor.parentNode.appendChild(fragment));
  }

  private prepareLocalsAndChildren(items: any[], fragment) {
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
  }

  private getArrayOfItems() {
    const items = this.of;

    if (Array.isArray(items)) {
      return items;
    }

    if (typeof items === 'number') {
      return new Array(10).fill(0).map((_, k) => k + 1);
    }

    return [];
  }

  private resetExecutionContext() {
    this.children.forEach((node) => node.executionContext.reset());
  }

  private compileChild(child: ContainerChild) {
    child.nodes.forEach((node) => this.dom.scanTree(node as HTMLElement, child.changeDetector, child.executionContext));
  }

  private createChild(): ContainerChild {
    const nodes = this.templateNodes.map((n) => n.cloneNode(true));

    return {
      nodes,
      detached: true,
      executionContext: this.executionContext.fork(),
      changeDetector: this.changeDetector.parent,
    };
  }

  private removeChild(child: ContainerChild) {
    child.nodes.forEach((node) => node.parentNode.removeChild(node));
  }

  private removeAllChildren() {
    if (this.children.length) {
      this.children.forEach((node) => this.removeChild(node));
      this.children = [];
    }
  }

  private createChildren(howMany: number) {
    const newNodes = Array(howMany)
      .fill(null)
      .map(() => this.createChild());

    newNodes.forEach((node) => this.compileChild(node));

    return newNodes;
  }

  private adjustChildrenLength(length: number) {
    const children = this.children;

    if (children.length < length) {
      const newNodes = this.createChildren(length - children.length);
      children.push(...newNodes);
      return;
    }

    if (children.length > length) {
      children.slice(length).forEach((node) => this.removeChild(node));
      children.length = length;
    }
  }
}
