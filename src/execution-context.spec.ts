import { ExecutionContext, SealedExecutionContext } from '.';

fdescribe('ExecutionContext', () => {
  it('runs an expression with provided locals and element', () => {
    const context = new ExecutionContext(null);
    context.addLocals({ number: 123, string: 'alice' });

    const output = context.run('string + number');

    expect(output).toBe('alice123');
  });

  it('runs an expression multiple times', () => {
    const context = new ExecutionContext(null);
    context.addLocals({ number: 123 });

    context.run('number + 1');
    context.run('number + 1');
    const output = context.run('number + 1');

    expect(output).toBe(124);
  });

  it('runs an expression in a fork of a context locals and element', () => {
    const parentContext = new ExecutionContext({ thisValue: 'the value is ' });

    parentContext.addLocals({
      number: 123,
      string: 'alice',
    });

    const newContext = parentContext.fork();
    newContext.addLocals({
      number: 456,
    });

    const output = newContext.run('this.thisValue + string + number');

    expect(output).toBe('the value is alice456');
  });

  it('merges the locals from current context, parent and additional values', () => {
    const parentContext = new ExecutionContext({ thisValue: 'the value is ' });

    parentContext.addLocals({
      number: 123,
      string: 'alice',
    });

    const newContext = parentContext.fork();
    newContext.addLocals({
      number: 456,
    });

    const thirdContext = newContext.fork();

    const output = thirdContext.run('number + string', { string: 'bob' });

    expect(output).toBe('456bob');
  });

  it('allows to reset local values', () => {
    const context = new ExecutionContext(null);

    context.addLocals({ number: 123 });
    context.reset();

    expect(() => context.run('number + 1')).toThrow(new ReferenceError('number is not defined'));
  });

  describe('SealedExecutionContext', () => {
    it('prevents context modifications ', () => {
      const context = new ExecutionContext(null);
      const sealedContext = new SealedExecutionContext(context);

      sealedContext.reset();
      sealedContext.addLocals({ local: true });
      expect(() => sealedContext.run('local')).toThrow(new ReferenceError('local is not defined'));
    });
  });
});

