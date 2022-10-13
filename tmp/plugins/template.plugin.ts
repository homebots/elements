import { Injector } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ComponentOptions, CustomElementPlugin, CustomHTMLElement } from '../custom-element/custom-element';
import { ExecutionContext } from '../execution-context';
import { Dom } from '../dom/dom';
import { DomScanner } from '../dom/dom-scanner';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };

export const TemplateRef = Symbol('TemplateRef');
export const ChildrenRef = Symbol('Children');

export class TemplatePlugin extends CustomElementPlugin {
  onCreate(element: CustomHTMLElement, options: ComponentOptions): void {
    this.createTemplateRef(element, options);
  }

  onBeforeInit(element: CustomHTMLElement, options: ComponentOptions) {
    const useShadowDom = options.shadowDom !== false;
    if (useShadowDom) {
      this.createShadowDom(options, element);
    } else {
      this.applyOpenTemplate(element);
    }

    this.scanTree(element);

    if (!useShadowDom) {
      this.transposeContent(element);
    }
  }

  private applyOpenTemplate(element: CustomHTMLElement) {
    element[ChildrenRef] = Array.from(element.children);
    element.appendChild(element[TemplateRef].content.cloneNode(true));
  }

  private createShadowDom(options: ComponentOptions, element: CustomHTMLElement) {
    const templateContent = element[TemplateRef].content.cloneNode(true);
    const shadowDomOptions = (options.shadowDom !== true && options.shadowDom) || defaultShadowDomOptions;
    const shadowRoot = element.attachShadow(shadowDomOptions);
    shadowRoot.appendChild(templateContent);
    return;
  }

  private createTemplateRef(element: CustomHTMLElement, options: ComponentOptions) {
    let templateText = options.template || '';
    if (options.styles) {
      templateText += `<style>${options.styles}</style>`;
    }

    // TODO if !templateText return
    const templateRef = Dom.createTemplateFromHtml(templateText);
    element[TemplateRef] = templateRef;

    return templateRef;
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
