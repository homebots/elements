import { inject } from '@homebots/injector';
import { clearDom, createHtml } from '@homebots/elements/testing';
import { DomScanner } from './dom-scanner';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';
import { ExecutionContext } from '../execution-context';

describe('DomScanner', () => {
  afterEach(() => clearDom());

  it('should scan an element and its descendants', () => {
    const node = createHtml(`
    <p [title]="testTitle" @dir="'rtl'">
      <span>{{ text }}</span>
      <template>
        <div>inside template {{ nothing happens }}</div>
      </template>
    </p>`);

    const context = new ExecutionContext();
    const cd = new ReactiveChangeDetector();

    context.addLocals({
      testTitle: 'test',
      text: 'just text',
    });

    const scanner = inject(DomScanner);

    scanner.scanTree(node, cd, context);
    cd.markAsDirtyAndCheck();

    expect(node.querySelector('p').title).toBe('test');
    expect(node.querySelector('p').dir).toBe('rtl');
    expect(node.querySelector('span').textContent).toBe('just text');
  });

  it('should replace text markers in a text node with data binding tags', () => {
    const node = createHtml('You say {{ youSay }} and I say {{ iSay }}');
    const context = new ExecutionContext();
    const cd = new ReactiveChangeDetector();
    context.addLocals({ youSay: 'goodbye', iSay: 'hello' });

    inject(DomScanner).scanTree(node, cd, context);
    cd.markAsDirtyAndCheck();

    expect(node.textContent.trim()).toBe('You say goodbye and I say hello');
  });
});
