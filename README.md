# Elements

This is a microframework that tries to use the latest API's from HTML, Javascript and CSS to run web apps.

What you get out-of-box:

- Dependency injection
- Custom elements
- Lifecycle hooks
- Change detection

# Usage

You need to import [Zone.js](https://www.npmjs.com/package/zone.js) and [Reflect API](https://www.npmjs.com/package/reflect-metadata) in your project.
Unpkg makes it super easy.

I tried [Parcel](https://parceljs.org) to bundle an example and it's dead easy to start an app.

Here's an example (also available under `/example`). To run this I used `parcel path/to/index.html`.

```html
<!-- index.html -->
<script src="https://unpkg.com/zone.js"></script>
<script src="https://unpkg.com/reflect-metadata"></script>
<script src="https://unpkg.com/@homebots/elements"></script>
<script src="./index.ts"></script>
<link rel="stylesheet" href="/index.scss" />
<!-- ... -->
<app-root></app-root>
```

```typescript
// index.ts
import { bootstrap } from '@homebots/elements';
export { AppComponent } from './app.component';
bootstrap();
```

```typescript
// app.component.ts

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
    this.name = this.appService.getRandomName();
  }
}
```

```typescript
// app.service.ts

import { Injectable } from '@homebots/elements';

@Injectable({
  providedBy: 'root'
})
export class NameGenerationService {
  getRandomName() {
    return 'Le Random Smith #' + Math.round(Math.random() * 999);
  }
}
```

```typescript
// app.template.ts

export default `
  <div>
    <h2>App root</h2>
    <label for="name">Your name:</label>

    <input id="name" [value]="this.name" (input)="this.name = $event.target.value" />
    <p>Hello, <span [innerText]="this.name"></span></p>

    <button (click)="this.updateName()">change to random name</button>
  </div>
`;

```

# TODO

Lots of things can be improved here.

I put this together in a few days as a braindump, so there's no test coverage yet. Sorry :(

I think this is not the most performant thing on Earth too, but I'm not trying to beat React or Angular.

The goal of this project is to provide a no-brainer jump start solution to create small apps and experiments.
The code will run on Chrome, Firefox or any recent/decent browser. I don't expect to ever support IE!