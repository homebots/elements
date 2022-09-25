import { TreeInjector as Injector } from '@homebots/injector';
import { ComponentOptions, CustomElementPlugin, CustomHTMLElement } from '../component';
import { ShadowDomToggle } from '../settings';

export class InjectorPlugin extends CustomElementPlugin {
  onCreate(component: CustomHTMLElement, options: ComponentOptions) {
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

  protected findParentInjector(component: CustomHTMLElement, options: ComponentOptions) {
    return (
      options.parentInjector ||
      (component.parentComponent && Injector.getInjectorOf(component.parentComponent)) ||
      Injector.global
    );
  }
}
