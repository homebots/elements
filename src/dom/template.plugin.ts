import { Injector } from '@homebots/injector';
import { ChangeDetector } from '../change-detection/change-detection';
import { ComponentOptions, CustomElementPlugin, CustomHTMLElement } from '../custom-element';
import { ExecutionContext } from '../execution-context';
import { Dom } from './dom';
import { DomScanner } from './dom-scanner';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };

export const TemplateRef = Symbol('TemplateRef');

export class TemplatePlugin extends CustomElementPlugin {
  onCreate(element: CustomHTMLElement, options: ComponentOptions): void {
    this.applyTemplate(element, options);
  }

  onInit(element: CustomHTMLElement, options: ComponentOptions): void {
    const usingShadowDom = options.shadowDom !== false;
    if (!usingShadowDom) {
      this.transposeContent(element);
    }

    this.scanTree(element);
  }

  protected applyTemplate(component: CustomHTMLElement, options: ComponentOptions): void {
    let templateText = options.template || '';
    if (options.styles) {
      templateText += `<style>${options.styles}</style>`;
    }

    const templateRef = Dom.createTemplateFromHtml(templateText);
    component[TemplateRef] = templateRef;
    const useShadowDom = options.shadowDom !== false;

    if (useShadowDom) {
      const templateContent = templateRef.content.cloneNode(true);
      const shadowDomOptions = (options.shadowDom !== true && options.shadowDom) || defaultShadowDomOptions;
      const shadowRoot = component.attachShadow(shadowDomOptions);
      shadowRoot.appendChild(templateContent);
    }
  }

  protected transposeContent(component: CustomHTMLElement) {
    const templateRef = component[TemplateRef];
    const templateContent = templateRef.content.cloneNode(true);

    const hasSlot = Boolean(templateRef.content.querySelector('slot'));
    if (!hasSlot) {
      component.appendChild(templateContent);
      return;
    }

    const currentContentNodes = Array.from(component.children);

    component.append(templateContent);
    const slot = component.querySelector('slot');

    currentContentNodes.forEach((node) => slot.append(node));
  }

  protected scanTree(element: CustomHTMLElement) {
    const injector = Injector.getInjectorOf(element);
    const changeDetector = ChangeDetector.getDetectorOf(element);
    const dom = injector.get(DomScanner);
    const children = Array.from(element.shadowRoot?.children || element.children);
    const executionContext = new ExecutionContext(element);

    children.forEach((node) => dom.scanTree(node as HTMLElement, changeDetector, executionContext));
  }
}
