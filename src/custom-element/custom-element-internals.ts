import { CustomElementPlugin, CustomElementOptions, CustomHTMLElement, customElement } from './types';

export class Internals {
  constructor(protected readonly plugins: CustomElementPlugin<any, any>[] = []) {
    this.plugins = plugins;
  }

  using(plugin: CustomElementPlugin<any, any>): Internals {
    return new Internals([...this.plugins, plugin]);
  }

  apply<C, Options extends CustomElementOptions>(target: C, method: string, options?: Options, ...args: any[]) {
    try {
      this.plugins.forEach((p) => p[method] && p[method](target, options, ...args));
    } catch (error) {
      this.plugins.forEach((p) => p.onError && p.onError(target, error));
    }

    return target;
  }

  queue: Array<[element: CustomHTMLElement, options: CustomElementOptions]> = [];
  queueTimer: any;
  queueTick() {
    if (!this.queueTimer) {
      this.queueTimer = setTimeout(() => this.onInit(), 16);
    }
  }

  private $nextTick: any;

  nextTick: Promise<void> = new Promise((tick) => (this.$nextTick = tick));

  onInit() {
    this.queue.forEach(([element, options]) => {
      this.apply(element, 'onInit', options);
      element.onInit && element.onInit();
      this.$nextTick();
    });

    this.queue = [];
    this.queueTimer = 0;
    this.nextTick = new Promise((tick) => (this.$nextTick = tick));
  }

  findParentComponent(component: CustomHTMLElement): CustomHTMLElement | null {
    let parentComponent: any = component;

    while (parentComponent && (parentComponent = parentComponent.parentNode || parentComponent.host)) {
      if (parentComponent[customElement]) {
        return parentComponent;
      }
    }

    return null;
  }

  onConnect<T extends CustomHTMLElement>(element: T, options: CustomElementOptions) {
    if (!element.isConnected) {
      return;
    }

    const parentComponent = this.findParentComponent(element);
    if (element[customElement]) {
      this.onMove(element, options, element.parentComponent, parentComponent);
      return;
    }

    element[customElement] = true;
    element.parentComponent = parentComponent;
    this.queue.push([element, options]);
    this.queueTick();

    try {
      this.apply(element, 'onConnect', options);
    } catch (error) {
      this.onError(element, error);
    }
  }

  onDisconnect<T extends CustomHTMLElement>(element: T) {
    if (element.isConnected) {
      return;
    }

    this.queue = this.queue.filter((next) => next[0] !== element);
    element.onDestroy && element.onDestroy();
    this.apply(element, 'onDisconnect');
  }

  onError<T extends CustomHTMLElement>(element: T, error: any) {
    console.error(element, error);
    this.apply(element, 'onError', null, error);
  }

  onDefine<T extends typeof CustomHTMLElement>(element: T, options: CustomElementOptions) {
    this.apply(element, 'onDefine', options);
  }

  onCreate<T extends CustomHTMLElement>(element: T, options: CustomElementOptions) {
    this.apply(element, 'onCreate', options);
  }

  onMove<T extends CustomHTMLElement>(
    element: T,
    options: CustomElementOptions,
    oldParent: CustomHTMLElement | null,
    newParent: CustomHTMLElement | null,
  ) {
    this.apply(element, 'onMove', options, oldParent, newParent);
  }
}
