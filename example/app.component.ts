import { Component, Inject } from '@homebots/elements';
import { NameGenerationService } from './app.service';
import appTemplate from './app.template';

@Component({
  tag: 'app-root',
  template: appTemplate,
})
export class AppComponent extends HTMLElement {
  name = 'John';

  @Inject() appService: NameGenerationService;

  updateName() {
    this.name = this.appService.getRandomName();
  }
}
