# Elements

This is a microframework that tries to use the latest API's from HTML, Javascript and CSS to run web apps.

What you get out-of-box:

- Dependency injection
- [Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements)
- Lifecycle hooks (onChange, OnInit, OnDestroy, OnBeforeCheck)
- Change detection (via [Zone.js](https://www.npmjs.com/package/zone.js))

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/homebots/elements)

## How to Use

First create some components:

```typescript
// src/app/app.component.ts
import { Component } from "@homebots/elements";

@Component({
  tag: "my-app",
  template: "<h1>Hello!</h1>",
})
export class AppComponent extends HTMLElement {}
```

Then bootstrap the application:

```typescript
//  src/index.ts
import { bootstrap } from "@homebots/elements";
export { AppComponent } from "./app/app.component.ts";

bootstrap();
```

Then finally put all together:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <script src="https://unpkg.com/zone.js"></script>
    <script src="https://unpkg.com/reflect-metadata"></script>
    <script src="./index.ts"></script>
  </head>

  <body>
    <my-app></my-app>
  </body>
</html>
```

## Build

I tried [Parcel](https://parceljs.org) to bundle the example and it's dead easy to start an app. Really cool stuff!
So I recommend it for a quick start:

```bash
$ npm install -g parcel-bundler
$ parcel src/index.html
```

## Syntax Examples

Most of the syntax is shamelessly copied from Angular and Alpine.js:

```html
<!-- bind an attribute -->
<div @class="this.dynamicClasses"></div>

<!-- bind a property -->
<div [innerText]="this.text"></div>

<!-- listening to events -->
<div (click)="this.onClick()"></div>

<!-- using references -->
<input #name />
<button (click)="name.focus()">click me</button>

<!-- conditional nodes -->

<template *if="this.showName" [else]="noname">Hello, John!</template>
<template #noname>Who are you?</template>

<!-- loops nodes -->
<ul>
  <template *for="'name'" [of]="this.listOfNames">
    <li [innerText]="name"></li>
  </template>
</ul>

<!-- conditional classes -->
<p [class.highlight]="this.isTextHighlighted">Lorem ipsum</p>
```

```typescript
// injectable class
@Injectable()
export class UserService {}

@Injectable()
export class AppService {
  // injected service
  @Inject() userService: UserService;

  // injected with symbol
  @Inject(ApplicationRef) userService: Application;
}
```

## Dependencies

You will need to import [Zone.js](https://www.npmjs.com/package/zone.js) and [Reflect API](https://www.npmjs.com/package/reflect-metadata) in your project.

Unpkg makes life so easy these days, amirite?
Just add these:

```html
<script src="https://unpkg.com/zone.js"></script>
<script src="https://unpkg.com/reflect-metadata"></script>
```

Here's a To-do list using Elements https://github.com/homebots/elements-example/tree/todo-app

# TODO

Lots of things can be improved here.
To name a few:

```
- Improve performance of conditionals and loops
- Add some error handling for easy debugging
- Add tests
```

I put this together in a few days as a braindump so there's no test coverage yet. Sorry :(

I think this is not the most performant thing on Earth too, but I'm not trying to beat React or Angular.

The goal of this project is to provide a no-brainer jump start solution to create small apps and experiments.
The code will run on Chrome, Firefox or any recent/decent browser.

I don't expect to ever fully support IE, but some polyfills could make it work.
