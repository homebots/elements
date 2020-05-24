import { Component } from '@homebots/elements';
import { AppService } from './app.service';
import appTemplate from './app.template';

@Component({
  tag: 'app-root',
  template: appTemplate,
})
export class AppComponent extends HTMLElement {
  name = 'John';

  @Inject()
  appService: AppService;

  updateName() {
    this.name = this.appService.getName();
  }
}
