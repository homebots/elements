import { Injector } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ComponentOptions, CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { ExecutionContext } from '../execution-context';
import { Dom } from '../dom/dom';
import { DomScanner } from '../dom/dom-scanner';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };

export const TemplateRef = Symbol('TemplateRef');
export const ChildrenRef = Symbol('Children');

export class TemplatePlugin extends CustomElementPlugin {
  onCreate(element: CustomHTMLElement, options: ComponentOptions): void {
    this.applyTemplate(element, options);
  }

  onBeforeInit(element: CustomHTMLElement, options: ComponentOptions): void {
    const usingShadowDom = options.shadowDom !== false;

    this.scanTree(element);

    if (!usingShadowDom) {
      this.transposeContent(element);
    }
  }

  protected applyTemplate(element: CustomHTMLElement, options: ComponentOptions): void {
    let templateText = options.template || '';
    if (options.styles) {
      templateText += `<style>${options.styles}</style>`;
    }

    // TODO if !templateText return
    const templateRef = Dom.createTemplateFromHtml(templateText);
    element[TemplateRef] = templateRef;
    const useShadowDom = options.shadowDom !== false;

    const templateContent = templateRef.content.cloneNode(true);

    if (useShadowDom) {
      const shadowDomOptions = (options.shadowDom !== true && options.shadowDom) || defaultShadowDomOptions;
      const shadowRoot = element.attachShadow(shadowDomOptions);
      shadowRoot.appendChild(templateContent);
      return;
    }

    element[ChildrenRef] = Array.from(element.children);
    element.appendChild(templateContent);
  }

  protected transposeContent(element: CustomHTMLElement) {
    const templateRef = element[TemplateRef];

    const hasSlot = Boolean(templateRef.content.querySelector('slot'));
    if (!hasSlot) {
      return;
    }

    const currentContentNodes = element[ChildrenRef] || [];
    const slot = element.querySelector('slot');

    currentContentNodes.forEach((node) => slot.append(node));
  }

  protected scanTree(element: CustomHTMLElement) {
    const injector = Injector.getInjectorOf(element);
    const changeDetector = ChangeDetector.getDetectorOf(element);
    const dom = injector.get(DomScanner);
    const children = Array.from(element.shadowRoot?.childNodes || element.childNodes);
    const executionContext = new ExecutionContext(element);

    children.forEach((node) => dom.scanTree(node as HTMLElement, changeDetector, executionContext));
  }
}
