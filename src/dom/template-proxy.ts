import { Changes, OnChanges } from '../change-detection/change-detection';

export type HTMLTemplateElementProxy = HTMLTemplateElement & {
  proxy: TemplateProxy;
};

export class TemplateProxy {
  private target: OnChanges;
  private queue = [];

  onChanges(changes: Changes) {
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
}
