/// <reference types="reflect-metadata" />

export type Type<T = object> = new (...args: any[]) => T;
export type InjectionToken<T = any> = symbol | Type<T>;
export interface Provider<T = any> {
  type: Type<T> | symbol;
  deps?: InjectionToken[];
  useClass?: Type<T>;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
}

export type Providers = Array<Provider | Type>;

export const InjectableMetadataKey = 'injectable';
export const InjectorSymbol = Symbol('injector');

export interface InjectableOptions {
  providedBy?: 'root' | InjectorApi;
}

const INJECTABLE_META = 'injectable';

export interface InjectorApi {
  has(token: InjectionToken, checkParents?: boolean): boolean;
  get<T>(token: InjectionToken<T>): T;
  create<T>(token: InjectionToken<T>, ...args: any[]): T;
  register(provider: Providers | Provider | Type): void;
}

export class Injector implements InjectorApi {
  protected providerMap? = new Map<InjectionToken, Provider>();
  protected cache? = new Map<InjectionToken, unknown>();
  readonly root: boolean;

  constructor(private parent?: InjectorApi, providers?: Providers) {
    if (!parent) {
      this.root = true;
    }

    if (providers) {
      providers.forEach((provider) => this.register(provider));
    }

    this.register({ type: Injector, useValue: this });
  }

  has(token: InjectionToken, checkParents = true): boolean {
    if (this.providerMap.has(token)) {
      return true;
    }

    if (checkParents && this.parent?.has(token, checkParents)) {
      return true;
    }

    const isLazy = Boolean(
      checkParents && this.root && typeof token === 'function' && Reflect.getMetadata(INJECTABLE_META, token),
    );

    return isLazy;
  }

  get<T>(token: InjectionToken<T>): T {
    if (this.has(token, false)) {
      return this.instantiateWithCache(token);
    }

    if (!this.root) {
      return this.parent.get(token);
    }

    // lazy registration of types on root injector
    if (typeof token === 'function') {
      const injectableMetadata = Reflect.getMetadata(INJECTABLE_META, token);

      if (injectableMetadata) {
        token.prototype[InjectorSymbol] = this;
        this.register({ type: token, useClass: token });

        return this.instantiateWithCache(token);
      }
    }

    throwIfNotFound(token);
  }

  create<T>(token: InjectionToken<T>, ...args: any[]): T {
    const provider: Provider<T> = this.providerMap.get(token) || { type: token, useClass: token as Type<T> };
    let value: T;

    switch (true) {
      case provider.useValue !== undefined:
        value = provider.useValue;
        break;

      case provider.useFactory !== undefined:
        const deps = provider.deps && provider.deps.map((token) => this.get(token));
        value = provider.useFactory.apply(null, deps);
        break;

      case provider.useClass !== undefined:
        value = new provider.useClass(...args);
        value[InjectorSymbol] = this;
        break;

      default:
        throwIfNotFound(token);
    }

    return value;
  }

  register(provider: Array<Provider | Type> | Provider | Type) {
    if (Array.isArray(provider)) {
      return provider.forEach((provider) => this.register(provider));
    }

    if (typeof provider === 'function') {
      this.providerMap.set(provider, { type: provider, useClass: provider });
      return;
    }

    this.providerMap.set(provider.type, provider);
  }

  private instantiateWithCache<T>(token: InjectionToken<T>): T {
    if (this.cache.has(token)) {
      return this.cache.get(token) as T;
    }

    const value = this.create(token);
    this.cache.set(token, value);

    return value;
  }
}

function throwIfNotFound(token: any) {
  throw new TypeError(String(token.name || token) + ' not found');
}

function throwIfTypeMetadataNotFound() {
  throw new TypeError('Type metadata not found. Did you forget to add @Injectable() to your class?');
}

export function Inject<T>(type?: InjectionToken<T>) {
  return (target: any, property: string) => {
    Object.defineProperty(target, property, {
      get() {
        if (!type) {
          type = Reflect.getMetadata('design:type', target, property);
        }

        if ((type as any) === Object) {
          throwIfTypeMetadataNotFound();
        }

        const value = getInjectorFrom(this).get(type);
        Object.defineProperty(this, property, { value });

        return value;
      },
    });
  };
}

export function Injectable() {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_META, true, target);
  };
}

export function getInjectorFrom(target: any): Injector {
  return target[InjectorSymbol];
}
