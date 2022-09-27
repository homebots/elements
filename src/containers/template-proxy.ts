import { OnChanges } from '../change-detection/change-detection';
import { Changes } from '../change-detection/observer';

export type HTMLTemplateElementProxy = HTMLTemplateElement & {
  proxy: TemplateProxy;
};

export class TemplateProxy extends HTMLElement {
  private target: OnChanges;
  private queue = [];

  onChanges(changes: Changes) {
    if (!changes || !Object.keys(changes).length) return;

    if (this.target) {
      this.target.onChanges(changes);
      return;
    }

    this.queue.push(() => this.onChanges(changes));
  }

  setProperty(property: string, value: any): void {
    if (this.target) {
      this.target[property] = value;
      return;
    }

    this.queue.push(() => this.setProperty(property, value));
  }

  setTarget(target: OnChanges): void {
    this.target = target;
    this.flush();
  }

  private flush() {
    this.queue.forEach((fn) => fn());
    this.queue.length = 0;
  }

  static create() {}
}
