import { ChangeDetector } from './change-detection';
import { ExecutionContext } from './execution-context';
import { IfContainer } from './containers/if-container';
import { ForContainer } from './containers/for-container';
import { addInputWatchers } from './inputs';

export function compileTemplate(template: HTMLTemplateElement, changeDetector: ChangeDetector, executionContext: ExecutionContext) {
  let containerName: string;
  let container: any;

  const attributes = template.getAttributeNames().filter(attribute => {
    if (attribute[0] === '*') {
      containerName = attribute;
      return false;
    }

    return true;
  });

  switch (containerName) {
    case '*if':
      container = new IfContainer(template, changeDetector, executionContext);
      break;

    case '*for':
      container = new ForContainer(template, changeDetector, executionContext);
      break;
  }

  if (!container) return;

  addInputWatchers(container, changeDetector);

  attributes.forEach(attribute => {
    if (attribute[0] !== '[') return;

    const expression = template.getAttribute(attribute);
    const unboxedAttribute = attribute.slice(1, -1);

    changeDetector.watch(
      () => executionContext.run(expression),
      (value: any) => {
        container[unboxedAttribute] = value;
        changeDetector.markForCheck();
      }
    );
  });
}
