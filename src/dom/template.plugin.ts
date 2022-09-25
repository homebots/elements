import { Injector } from '@homebots/injector';
import { ChangeDetector } from 'src/change-detection/change-detection';
import { ComponentOptions, CustomElementPlugin, CustomHTMLElement } from 'src/component';
import { ExecutionContext } from '../execution-context';
import { Dom } from './dom';
import { DomScanner } from './dom-scanner';

const defaultShadowDomOptions: ShadowRootInit = { mode: 'open' };

export const TemplateRef = Symbol('TemplateRef');

export class TemplatePlugin extends CustomElementPlugin {
  onCreate(element: CustomHTMLElement, _options: ComponentOptions): void {
    const injector = Injector.getInjectorOf(element);
    const dom = injector.get(DomScanner);
    const children = Array.from(element.shadowRoot?.children || element.children);
    const executionContext = new ExecutionContext(element);
    const changeDetector = ChangeDetector.getDetectorOf(element);

    children.forEach((node) => dom.scanTree(node as HTMLElement, changeDetector, executionContext));
  }

  onInit(component: CustomHTMLElement, options: ComponentOptions): void {
    const useShadowDom = options.shadowDom !== false;

    let templateText = options.template || '';
    if (options.styles) {
      templateText += `<style>${options.styles}</style>`;
    }

    const templateRef = Dom.createTemplateFromHtml(templateText);
    const templateContent = templateRef.content.cloneNode(true);
    component[TemplateRef] = templateRef;

    if (useShadowDom) {
      const shadowDomOptions = (options.shadowDom !== true && options.shadowDom) || defaultShadowDomOptions;
      const shadowRoot = component.attachShadow(shadowDomOptions);
      shadowRoot.appendChild(templateContent);
      return;
    }

    const hasSlot = Boolean(templateRef.content.querySelector('slot'));

    if (hasSlot) {
      component.appendChild(templateContent);
      return;
    }

    const currentContentNodes = Array.from(component.children);
    component.append(templateContent);
    const slot = component.querySelector('slot');

    currentContentNodes.forEach((node) => slot.append(node));
  }
}
