import { Inject } from '@homebots/injector';
import { Input } from 'src/component-decorators';
import { ChangeDetector, OnChanges } from '../change-detection/change-detection';
import { Changes } from '../change-detection/observer';
import { Dom } from '../dom/dom';
import { DomScanner } from '../dom/dom-scanner';
import { ExecutionContext } from '../execution-context';
import { setTimeoutNative } from '../utils';

interface ContainerChild {
  executionContext: ExecutionContext;
  changeDetector: ChangeDetector;
  nodes: Node[];
  detached: boolean;
}

export class ForContainer implements OnChanges {
  @Inject() dom: DomScanner;
  @Input() of: Iterable<any> | Array<any>;
  @Input() for: string;

  private children: ContainerChild[] = [];
  private templateNodes: Node[];

  constructor(
    private template: HTMLTemplateElement,
    private changeDetector: ChangeDetector,
    private executionContext: ExecutionContext,
  ) {
    Dom.normalizeTemplate(template);
    this.templateNodes = Array.from(template.content.childNodes);
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

    setTimeoutNative(() => this.template.parentNode.appendChild(fragment));
  }

  private prepareLocalsAndChildren(items: any[], fragment) {
    items.forEach((item, index) => {
      const child = this.children[index];
      const locals: any = {};

      locals[this.for] = item;
      locals.index = index;
      locals.odd = index % 2 === 1;

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
    for (const node of this.children) {
      node.executionContext.reset();
    }
  }

  private compileChild(child: ContainerChild) {
    const nodes = Array.from(child.nodes);

    for (const node of nodes) {
      this.dom.scanTree(node as HTMLElement, child.changeDetector, child.executionContext);
    }
  }

  private createChild(): ContainerChild {
    const nodes = this.templateNodes.map((n) => n.cloneNode(true));

    return {
      nodes,
      detached: true,
      executionContext: this.executionContext.fork(),
      changeDetector: this.changeDetector.fork(),
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
