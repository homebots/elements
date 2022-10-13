import { Component } from '../../../src/index';

export interface Task {
  done: boolean;
  title: string;
}

@Component({
  shadowDom: false,
  tag: 'todo-app',
  template: `
    <form (submit.stop)="this.addTask(newtask.value); newtask.value = ''">
      <input #newtask (input) />
      <button type="submit" [disabled]="!newtask.value">add</button>
    </form>
    <template *if="!this.tasks.length">No tasks</template>
    <template *if="this.tasks.length">
      <ul>
        <template *for [for]="'task'" [of]="this.tasks">
          <li>
            <input type="checkbox" (change.stop)="task.done = !task.done" [value]="task.done" />
            <span>{{ task.title }}</span>
            <button (click)="this.removeTask(task.title)">remove</button>
          </li>
        </template>
      </ul>
  </template>
  `,
  styles: `
  ul { list-style: none; margin: 0; padding: 1rem }
  li { display: flex }
  li > span { flex-grow: 1 }
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
