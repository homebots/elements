# Elements

This is a microframework that tries to use the latest API's from HTML, Javascript and CSS to run web apps.

What you get out-of-box:

- Dependency injection
- [Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements)
- Lifecycle hooks (onChange, OnInit, OnDestroy, OnBeforeCheck)
- Change detection (via [Zone.js](https://www.npmjs.com/package/zone.js))

# Syntax Examples

Most of the syntax is shamelessly copied from Angular and Alpine.js:

```html
<!-- bind an attribute -->
<div @class="this.dynamicClasses"></div>

<!-- bind a property -->
<div [innerText]="this.text"></div>

<!-- bind to events -->
<div (click)="this.onClick()"></div>

<!-- references -->
<input #name/>
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

# Usage

You need to import [Zone.js](https://www.npmjs.com/package/zone.js) and [Reflect API](https://www.npmjs.com/package/reflect-metadata) in your project.
Unpkg makes life so easy, amirite?

I also tried [Parcel](https://parceljs.org) to bundle the example and it's dead easy to start an app. Really cool stuff!

Here's a To-do list using Elements https://github.com/homebots/elements-example/tree/todo-app

# TODO

Lots of things can be improved here.
To name a few:

```
- Implement performance of conditionals and loops
- Add some error handling to ease debugging
- Add tests
```

I put this together in a few days as a braindump so there's no test coverage yet. Sorry :(

I think this is not the most performant thing on Earth too, but I'm not trying to beat React or Angular.

The goal of this project is to provide a no-brainer jump start solution to create small apps and experiments.
The code will run on Chrome, Firefox or any recent/decent browser. 

I don't expect to ever fully support IE, but some polyfills could make it work.
