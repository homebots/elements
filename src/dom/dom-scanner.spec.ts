import { inject } from '@homebots/injector';
import { clearDom, createHtml } from '@homebots/elements/testing';
import { DomScanner } from './dom-scanner';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';
import { ExecutionContext } from '../execution-context';

fdescribe('DomScanner', () => {
  afterEach(() => clearDom());

  it('should replace text markers in a text node with data binding tags', () => {
    const node = createHtml('You say {{ youSay }} and I say {{ iSay }}');
    const context = new ExecutionContext();
    const cd = new ReactiveChangeDetector();
    context.addLocals({ youSay: 'goodbye', iSay: 'hello' });

    inject(DomScanner).scanElement(node, cd, context);
    cd.scheduleTreeCheck();

    // expect(node.textContent.trim()).toBe('');
  });
});
