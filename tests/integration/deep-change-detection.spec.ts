import { Bootstrap, ChangeDetector, CustomElement, Input } from '../../src';
import { createHtml, wait } from '../../src/testing';

describe('change detector in multiple levels', () => {
  fit('should connect child nodes with parents', async () => {
    class TestComponent extends HTMLElement {
      @Input() uid = 0;
    }

    const nodeNames = Array(10)
      .fill('x-node')
      .map((s, i) => s + i);

    nodeNames.forEach((tag) => CustomElement.define(TestComponent, { tag, shadowDom: false, template: `{{ uid }}` }));
    const template = `
    <x-node1 [uid]="1">
      <x-node2 [uid]="this.parentNode.uid + 1">
        <x-node3 [uid]="this.parentNode.uid + 1">
          <x-node4 [uid]="this.parentNode.uid + 1">
            <x-node5 [uid]="this.parentNode.uid + 1"></x-node5>
          </x-node4>
        </x-node3>
      </x-node2>
    </x-node1>
    <x-node1 [uid]="1">
      <x-node2 [uid]="2">
        <x-node3 [uid]="3">
          <x-node4 [uid]="4">
            <x-node5 [uid]="5"></x-node5>
          </x-node4>
        </x-node3>
      </x-node2>
    </x-node1>
    `;
    const root = createHtml(template);
    const app = Bootstrap.createApplication(root);
    await app.check();
    await wait(10);

    expect(ChangeDetector.getDetectorOf(root.firstElementChild).parent).toBe(app.changeDetector);
    let nextNode: any = root.firstElementChild;
    let parentDetector: any = app.changeDetector;
    console.log(root);

    while (nextNode) {
      console.log(nextNode.uid);
      let nextDetector = ChangeDetector.getDetectorOf(nextNode);
      expect(nextDetector.parent).toBe(parentDetector);
      expect(String(nextDetector.id).slice(1) > String(parentDetector.id).slice(1)).toBe(true);
      nextNode = nextNode.firstElementChild;
      parentDetector = nextDetector.parent;
    }

    nextNode = root.firstElementChild?.nextElementSibling;
    parentDetector = app.changeDetector;
    while (nextNode) {
      console.log(nextNode.uid);
      let nextDetector = ChangeDetector.getDetectorOf(nextNode);
      expect(nextDetector.parent).toBe(parentDetector);
      expect(String(nextDetector.id).slice(1) > String(parentDetector.id).slice(1)).toBe(true);
      nextNode = nextNode.firstElementChild;
      parentDetector = nextDetector.parent;
    }
  });
});
