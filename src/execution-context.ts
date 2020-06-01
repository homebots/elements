export interface ExecutionLocals {
  [local: string]: any;
}

export class ExecutionContext {
  locals: ExecutionLocals;

  constructor(
    private component: HTMLElement,
    private parent?: ExecutionContext,
  ) {}

  addLocals(locals: ExecutionLocals) {
    Object.assign(this.locals, locals);
  }

  fork() {
    return new ExecutionContext(this.component, this);
  }

  run(expression: string, localValues?: ExecutionLocals) {
    const locals = this.getLocals(localValues);
    const localsByName = Object.keys(locals);
    const localsAsArray = localsByName.map(key => locals[key]);
    const fn = Function(...localsByName, expression).bind(this.component, ...localsAsArray);
    debugger;
    return fn();
  }

  compile(expression: string) {
    const locals = this.getLocals();
    const localsByName = Object.keys(locals);
    const localsAsArray = localsByName.map(key => locals[key]);

    return Function(...localsByName, expression).bind(this.component, ...localsAsArray);
  }

  private getLocals(additionalValues?: ExecutionLocals) {
    return Object.assign({}, this.parent && this.parent.getLocals(), this.locals, additionalValues);
  }
}
