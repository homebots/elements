# Elements

This is a microframework that tries to use the latest API's from HTML, Javascript and CSS to run web apps.

Using [Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements) and a few other
features, like [dependency injection](https://github.com/homebots/injector), change detection and lifecycle hooks.

## Lifecycle hooks

Every custome element can implement one of the following hooks: `OnInit`, `OnDestroy`, `onChanges`, `OnBeforeCheck`

## Change detection

Every instance has its own change detection context, but when a component changes something, the
change detection looks at all observed properties in that context and all children, starting from the root element.

This is to ensure that changes that affect the parent elements can also be checked.

> As an alternative, change detection (via [Zone.js](https://www.npmjs.com/package/zone.js)) can be used as well.

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
