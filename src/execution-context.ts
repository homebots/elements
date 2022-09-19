import { Fn } from './utils';

export interface ExecutionLocals {
  [local: string]: any;
}

export interface RunOptions {
  noReturn: boolean;
  async: boolean;
}

const expressionCache = new Map<string, Fn>();
// const AsyncFunction = (async function () {}).constructor;

export class ExecutionContext {
  locals: ExecutionLocals;

  constructor(private thisValue: object | null = null, private parent?: ExecutionContext) {}

  addLocals(locals: ExecutionLocals) {
    Object.assign(this.locals || (this.locals = {}), locals);
  }

  reset() {
    this.locals = {};
  }

  fork(newContext?: HTMLElement) {
    return new ExecutionContext(newContext || this.thisValue, this);
  }

  run(expression: string, localValues?: ExecutionLocals, options?: RunOptions) {
    const fn = this.compile(expression, localValues, options);
    try {
      return fn();
    } catch (e) {
      console.error(expression, e.message);
      throw e;
    }
  }

  compile(expression: string, localValues?: ExecutionLocals, options?: RunOptions) {
    const locals = this.getLocals(localValues);
    const localsByName = Object.keys(locals);
    const cacheKey = expression + localsByName;

    if (!expressionCache.has(cacheKey)) {
      expressionCache.set(cacheKey, Function(...localsByName, `${options?.noReturn ? '' : 'return'} ${expression}`));
    }

    const localsAsArray = localsByName.map((key) => locals[key]);
    return expressionCache.get(cacheKey).bind(this.thisValue, ...localsAsArray);
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

export class SealedExecutionContext extends ExecutionContext {
  constructor(parent?: ExecutionContext) {
    super(null, parent);
  }

  addLocals(_: ExecutionLocals) {}
  reset() {}
}

export const NullContext = new SealedExecutionContext();
