import { Component } from '../../src/index';

export interface Task {
  done: boolean;
  title: string;
}

@Component({
  tag: 'todo-app',
  template: `
    <form (submit.stop)="this.addTask(newtask.value); newtask.value = ''">
      <input #newtask (input) />
      <button type="submit">add</button>
    </form>
    <ul>
      <template *for="'task'" [of]="this.tasks">
        <li>
          <input type="checkbox" (change.stop)="task.done = !task.done" [value]="task.done" />
          <span>{{ task.title }}</span>
          <button (click)="this.removeTask(task.title)"></button>
        </li>
      </template>
    </ul>
  `,
})
export class TodoApp extends HTMLElement {
  tasks: Task[] = [];

  addTask(title: string) {
    this.tasks = [...this.tasks, { done: false, title }];
  }

  removeTask(title: string) {
    this.tasks = this.tasks.filter((task) => task.title !== title);
  }
}
