import { inject } from '@homebots/injector';
import { clearDom, createHtml } from '@homebots/elements/testing';
import { DomScanner } from './dom-scanner';
import { ReactiveChangeDetector } from '../change-detection/reactive-change-detector';
import { ExecutionContext } from '../execution-context';

describe('DomScanner', () => {
  afterEach(() => clearDom());

  it('should replace text markers in a text node with data binding tags', () => {
    const node = createHtml('You say {{ youSay }} and I say {{ iSay }}');
    inject(DomScanner).scanElement(node, new ReactiveChangeDetector(), new ExecutionContext());
  });
});
