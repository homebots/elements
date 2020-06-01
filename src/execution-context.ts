export interface ExecutionLocals {
  [local: string]: any;
}

export class ExecutionContext {
  locals: ExecutionLocals = {};

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
    const fn = this.compile(expression, localValues);
    try {
      return fn();
    } catch (error) {
      console.log(error);
    }
  }

  compile(expression: string, localValues?: ExecutionLocals) {
    const locals = this.getLocals(localValues);
    const localsByName = Object.keys(locals);
    const localsAsArray = localsByName.map(key => locals[key]);

    return Function(...localsByName, `return ${expression}`).bind(this.component, ...localsAsArray);
  }

  private getLocals(additionalValues?: ExecutionLocals) {
    const locals = {};

    if (this.parent) {
      Object.assign(locals, this.parent.getLocals());
    }

    Object.assign(locals, this.locals);

    if (additionalValues) {
      Object.assign(locals, additionalValues);
    }

    return locals;
  }
}
