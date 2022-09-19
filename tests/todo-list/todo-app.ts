import { Component } from '../../src/index';

export interface Task {
  done: boolean;
  title: string;
}

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
  tasks: Task[] = [];

  addTask(title: string) {
    return this.tasks.push({ done: false, title });
  }
}

// import { Component } from '../../src/index';
// import { Inject } from '@homebots/injector';
// import { Task, TaskService } from './task.service';
// import './task-list.component';
// import './task-form.component';

// const template = `
//   <div class="container">
//     <todo-taskform
//       class="my-4"
//       (search)="this.onSearch($event.detail)"
//       (add)="this.onAdd($event.detail)"></todo-taskform>

//     <template *if="!this.tasks.length">No tasks found.</template>

//     <template *if="this.tasks.length">
//       <todo-tasklist [tasks]="this.filteredTasks" (complete)="this.onComplete($event.detail)" (remove)="this.onRemove($event.detail)"></todo-tasklist>
//     </template>
//   </div>
// `;

// @Component({
//   tag: 'todo-app',
//   template,
// })
// export class TodoAppComponent extends HTMLElement {
//   @Inject() private service: TaskService;
//   private filter: string;

//   get tasks() {
//     return this.service.tasks;
//   }

//   get filteredTasks() {
//     return (
//       (this.filter ? this.service.tasks.filter((task) => task.name.includes(this.filter)) : this.service.tasks) ?? []
//     );
//   }

//   onSearch(text: string) {
//     this.filter = text;
//   }

//   onAdd(task: string) {
//     this.service.add(task);
//   }

//   onRemove(task: Task) {
//     this.service.remove(task.name);
//   }

//   onComplete(task: Task) {
//     this.service.complete(task.name);
//   }
// }
