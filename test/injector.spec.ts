import { Injector, Injectable, InjectorSymbol, getInjectorFrom, Inject } from '../src/injector';

describe('Injector', () => {
  it('should tell if an injectable is present', () => {
    class InjectableClass {}
    const injector = new Injector(null, [InjectableClass]);

    expect(injector.has(InjectableClass)).toBe(true);
  });

  it('should retrieve an injectable with a Class reference', () => {
    class InjectableClass {}
    const injector = new Injector(null, [InjectableClass]);

    expect(injector.get(InjectableClass) instanceof InjectableClass).toBe(true);
  });

  it('should retrieve an injectable with a token/symbol reference', () => {
    class InjectableWithSymbol {}
    const InjectionRef = Symbol('injection');
    const injector = new Injector(null, [{ type: InjectionRef, useClass: InjectableWithSymbol }]);

    expect(injector.get(InjectionRef) instanceof InjectableWithSymbol).toBe(true);
  });

  it('should provide a class on root injector automatically', () => {
    @Injectable()
    class ClassProvidedOnRootInjector {}

    const injector = new Injector();
    expect(injector.root).toBe(true);

    const value = injector.get(ClassProvidedOnRootInjector);
    expect(value instanceof ClassProvidedOnRootInjector).toBe(true);
    expect(value[InjectorSymbol]).toBe(injector);
  });

  it('should throw an error if token/symbol is not available', () => {
    class NotInjectable {}
    const NotInjectableEither = Symbol('nope');
    const injector = new Injector();

    expect(() => injector.get(NotInjectable)).toThrow(new TypeError('NotInjectable not found'));
    expect(() => injector.get(NotInjectableEither)).toThrow(new TypeError('Symbol(nope) not found'));
  });

  it('should allow a class to be registered', () => {
    class InjectableClass {}
    const injector = new Injector();

    injector.register(InjectableClass);

    expect(injector.has(InjectableClass)).toBe(true);
  });

  it('should allow an array of injectables to be registered', () => {
    class InjectableClass {}
    class InjectableClassByToken {}

    const injector = new Injector();
    const token = Symbol('token');

    injector.register([
      InjectableClass,
      { type: token, useClass: InjectableClassByToken }
    ]);

    expect(injector.has(InjectableClass)).toBe(true);
    expect(injector.has(token)).toBe(true);
  });

  it('should allow a factory to be registered', () => {
    class FactoryDependency {
      getValue() { return 'value'; }
    }

    function factory(dependency: FactoryDependency) {
      return dependency.getValue();
    }

    const injector = new Injector();
    const token = Symbol('token');

    injector.register([
      FactoryDependency,
      { type: token, useFactory: factory, deps: [FactoryDependency] }
    ]);

    expect(injector.has(token)).toBe(true);
    expect(injector.get(token)).toBe('value');
  });

  it('should allow a value to be registered', () => {
    const injector = new Injector();
    const token = Symbol('token');

    injector.register([
      { type: token, useValue: 'value' }
    ]);

    expect(injector.has(token)).toBe(true);
    expect(injector.get(token)).toBe('value');
  });

  it('should throw an error if token/symbol was not properly registered', () => {
    class BadConfiguration {}
    const injector = new Injector(null, [{ type: BadConfiguration }]);

    expect(() => injector.get(BadConfiguration)).toThrow(new TypeError('BadConfiguration not found'));
  });

  it('should search for dependencies in a parent injector', () => {
    @Injectable()
    class ProvidedByParent {}

    const parentInjector = new Injector();
    const injectorLevel1 = new Injector(parentInjector);
    const injectorLevel2 = new Injector(injectorLevel1);

    expect(injectorLevel2.has(ProvidedByParent)).toBe(true);
    expect(injectorLevel2.has(ProvidedByParent, false)).toBe(false);
    expect(injectorLevel2.get(ProvidedByParent) instanceof ProvidedByParent).toBe(true);
  });

  it('should create an instance of a given constructor and arguments', () => {
    class AdHocClass {
      constructor(public id: string) {}
    }

    const injector = new Injector();
    const instance = injector.create(AdHocClass, '123');

    expect(instance.id).toBe('123');
  });

  it('should cache injectables', () => {
    @Injectable()
    class CachedClass {}

    const injector = new Injector();
    const instance = injector.get(CachedClass);
    const cachedInstance = injector.get(CachedClass);

    expect(instance === cachedInstance).toBe(true);
  });

  it('should cache injectables', () => {
    @Injectable()
    class Dependency {}

    const ValueToken = Symbol('token');

    @Injectable()
    class ClassWithInjector {
      @Inject() dependency: Dependency;
      @Inject(ValueToken) value: string;
      @Inject() invalidType: any;
    }

    const injector = new Injector(null, [{ type: ValueToken, useValue: 'value' }]);
    const instance = injector.get(ClassWithInjector);

    expect(getInjectorFrom(instance)).toBe(injector);

    expect(instance.dependency instanceof Dependency).toBe(true);
    expect(instance.value).toBe('value');
    expect(() => instance.invalidType).toThrow();
  });
});
