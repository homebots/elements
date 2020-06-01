import 'reflect-metadata';

export const Type = Function;
export type Type<T = object> = new(...args: any[]) => T;
export type InjectionToken<T = any> = symbol | Type<T>;
export interface Provider<T = any> {
  type: Type<T> | symbol;
  useClass?: T;
  useValue?: T;
}

export const InjectableMetadataKey = 'injectable';
export const InjectorSymbol = Symbol('injector');

export interface InjectableOptions {
  providedBy: 'root' | Injector
}

const NullInjector = {
  get(token: any) {
    throw new Error(String(token.name || token) + ' not found');
  },
};

const INJECTABLE_META = 'injectable';

export class Injector {
  protected providerMap? = new Map<InjectionToken, Provider>();
  protected cache? = new Map<InjectionToken, Type>();
  readonly root: boolean;

  constructor(
    private parent?: Injector,
    providers?: Array<Provider | Type>,
  ) {
    if (!parent) {
      (this as any).parent = NullInjector;
      this.root = true;
    }

    if (providers) {
      providers.forEach(provider => this.register(provider));
    }

    this.register({ type: Injector, useValue: this });
  }

  has(token: InjectionToken, checkParents = false): boolean {
    return this.providerMap.has(token) || (checkParents && this.parent && this.parent.has(token));
  }

  get<T>(token: InjectionToken<T>): T {
    if ((token as any) === Injector) {
      return this as unknown as T;
    }

    if (this.has(token)) {
      return this.instantiate(token);
    }

    // lazy registration of types on root injector
    if (this.root && typeof token === 'function') {
      const providerOptions = Reflect.getMetadata(INJECTABLE_META, token) || {};
      if (providerOptions.providedBy === 'root') {
        token.prototype[InjectorSymbol] = this;
        this.register({ type: token, useClass: token });
        return this.instantiate(token);
      }

      if (providerOptions.providedBy && providerOptions.providedBy instanceof Injector) {
        const injector = providerOptions.providedBy;
        token.prototype[InjectorSymbol] = injector;
        injector.register({ type: token, useClass: token });
        return injector.instantiate(token);
      }
    }

    return this.parent.get(token);
  }

  register(provider: Provider | Type) {
    if (typeof provider === 'function') {
      this.providerMap.set(provider, { type: provider, useClass: provider });
    } else {
      this.providerMap.set(provider.type, provider);
    }
  }

  private instantiate(token: InjectionToken) {
    if (this.cache.has(token)) {
      return this.cache.get(token);
    }

    const provider = this.providerMap.get(token);
    const value = provider.useValue || new provider.useClass();
    this.cache.set(token, value);

    return value;
  }
}

export function Inject() {
  return (target: any, property: string) => {
    Object.defineProperty(target, property, {
      get() {
        const type = Reflect.getMetadata('design:type', target, property);

        if (!type) {
          throw new Error('Type metadata not found. Did you forget to add @Injectable() to your class?');
        }

        const value = getInjectorFrom(this).get(type);
        Object.defineProperty(this, property, { value });

        return value;
      },
    });
  };
}

export function Injectable(options?: InjectableOptions) {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_META, options, target);
  };
}

export function getInjectorFrom(target: Type | HTMLElement): Injector {
  return target[InjectorSymbol];
}
