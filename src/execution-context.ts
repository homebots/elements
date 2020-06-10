import { Fn } from './utils';

export interface ExecutionLocals {
  [local: string]: any;
}

const expressionCache = new Map<string, Fn>();

export class ExecutionContext {
  locals: ExecutionLocals;

  constructor(
    private component: HTMLElement,
    private parent?: ExecutionContext,
  ) {}

  addLocals(locals: ExecutionLocals) {
    Object.assign(this.locals || (this.locals = {}), locals);
  }

  fork(newContext?: HTMLElement) {
    return new ExecutionContext(newContext || this.component, this);
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
    const cacheKey = expression + localsByName;

    if (!expressionCache.has(cacheKey)) {
      expressionCache.set(cacheKey, Function(...localsByName, `return ${expression}`));
    }

    const localsAsArray = localsByName.map(key => locals[key]);
    return expressionCache.get(cacheKey).bind(this.component, ...localsAsArray);
  }

  private getLocals(additionalValues?: ExecutionLocals) {
    const locals = {};

    if (this.parent) {
      Object.assign(locals, this.parent.getLocals());
    }

    if (this.locals) {
      Object.assign(locals, this.locals);
    }

    if (additionalValues) {
      Object.assign(locals, additionalValues);
    }

    return locals;
  }
}

