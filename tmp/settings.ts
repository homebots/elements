import { Injectable } from '@homebots/injector';

@Injectable()
export class ShadowDomToggle {
  enabled: boolean = true;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle(value: boolean) {
    this.enabled = Boolean(value);
  }
}
