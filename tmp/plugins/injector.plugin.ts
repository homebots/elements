import { Provider, TreeInjector as Injector } from '@homebots/injector';
import { CustomElementOptions, CustomElementPlugin, CustomHTMLElement } from '../custom-element/custom-element';
import { ShadowDomToggle } from '../settings';

interface InjectorOptions extends CustomElementOptions {
  providers?: Provider[];
  parentInjector?: Injector;
}

export class InjectorPlugin extends CustomElementPlugin {
  onCreate(component: CustomHTMLElement, options: InjectorOptions) {
    let injector = Injector.getInjectorOf(component);

    if (!injector) {
      const parent = this.findParentInjector(component, options);
      injector = new Injector(parent);
      Injector.setInjectorOf(component, injector);
    }

    if (options.providers) {
      injector.provideAll(options.providers);
    }

    if (options.shadowDom === undefined) {
      options.shadowDom = injector.get(ShadowDomToggle).enabled;
    }
  }

  protected findParentInjector(component: CustomHTMLElement, options: CustomElementOptions) {
    return (
      options.parentInjector ||
      (component.parentComponent && Injector.getInjectorOf(component.parentComponent)) ||
      Injector.global
    );
  }
}
