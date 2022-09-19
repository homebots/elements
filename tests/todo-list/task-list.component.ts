import { Component, DomEventEmitter, Input, Output } from '../../src/index';
import { Task } from './task.service';

const template = `
    <h3 [hidden]="true">Tasks left: <span [innerText]="this.tasks.length"></span></h3>

    <ul class="m-0 p-0 bg-light d-block">
      <template *for="'task'" [of]="this.tasks">
        <li class="input-group input-group-sm mb-1" tabindex="0" (click)="this.onComplete.emit(task)">
          <div class="input-group-text">
          <input type="checkbox" [checked]="task.done" class="form-check-input mt-0" />
          </div>
          <span [class.text-decoration-line-through]="task.done" class="form-control" [innerText]="task.name"></span>
          <button class="btn btn-outline-secondary" class="mx-2" (click.stop)="this.onRemove.emit(task)">&times;</button>
        </li>
      </template>
    </ul>
  `;

@Component({
  tag: 'todo-tasklist',
  template,
})
export class TaskListComponent extends HTMLElement {
  @Input() tasks: Task[];
  @Output('complete') onComplete: DomEventEmitter<Task>;
  @Output('remove') onRemove: DomEventEmitter<Task>;
}
