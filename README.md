# Elements

This is a library that embraces the latest browser API's to run web apps.

Some key points this library will always follow:

- Always use the native solution whenever possible.
- Everything should be open for extension, via plugins
- No custom API's that deviate too much from the web platform
- As little abstraction as possible

## But what are custom elements?

[Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements) are part of the Web Components API and allow JS code to define customised HTML tag names.

A custom element has a few callbacks that are invoked when an element is attached to the DOM or removed from it.

So this library takes care of hooking up these callbacks to a plugin system, and any features you might want to use can be implemented as such


features, like [dependency injection](https://github.com/homebots/injector), change detection and lifecycle hooks.

## Lifecycle hooks

Every custom element can implement custom hooks, like `OnInit`, `OnDestroy`, `onChanges` and so on.

## Change detection

Every instance has its own change detection instance.
Syntax rules, like property bindings or events, can cause side effects, which are observed inside a custom element instance.

## Examples

A minimalistic todo app:

```typescript
// app.component.ts
import { Component } from '@homebots/elements';

@Component({
  tag: 'todo-app',
  template: `
    <form (submit.stop)="this.addTask(newtask.value); newtask.value = ''">
      <input #newtask />
      <button type="submit">add</button>
    </form>
    <ul>
      <template *for="'task'" [of]="this.tasks">
        <li><input type="checkbox" (change.stop)="task.done = !task.done" [value]="task.done" /> {{ task.title }}</li>
      </template>
    </ul>
  `,
})
export class TodoApp extends HTMLElement {
  tasks = [];

  addTask(title: string) {
    return this.tasks.push({ done: false, title });
  }
}
```

Then bootstrap the application:

```typescript
// index.ts
import { Bootstrap } from '@homebots/elements';
import './app.component.ts';

Bootstrap.createApplication();
```

Then finally put all together:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo</title>
    <script src="https://unpkg.com/reflect-metadata"></script>
    <script type="module" src="./index.ts"></script>
  </head>

  <body>
    <todo-app></todo-app>
  </body>
</html>
```

## Syntax

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

<!-- loops -->
<ul>
  <template *for="'name'" [of]="this.listOfNames">
    <li>{{name}}</li>
  </template>
</ul>

<!-- conditional classes -->
<p [class.highlight]="this.isTextHighlighted">Lorem ipsum</p>
```

## Dependency Injection

```typescript
// injectable class
@Injectable()
export class UserService {}

@Injectable()
export class AppService {
  // injected service
  @Inject() userService: UserService;

  // injected with symbol
  @Inject(ChangeDetector) userService: ChangeDetector;
}
```

## Dependencies

The [Reflect API](https://www.npmjs.com/package/reflect-metadata) for Typescript metadata.

```html
<script src="https://unpkg.com/reflect-metadata"></script>
```
