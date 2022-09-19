import { Component, DomEventEmitter, Output } from '../../src/index';

const template = `
<form (submit.stop)="this.onAdd.emit(taskname.value),taskname.value = ''">
  <div class="w-100 d-flex input-group">
    <button type="button" (click)="taskname.value = '';">&times;</button>
    <input #taskname type="text" class="form-control" name="search" placeholder="new task" />
    <button class="btn btn-primary" type="submit">add</button>
    <button class="btn btn-outline-secondary" type="button"
      (click)="this.onSearch.emit(taskname.value)"
    >search</button>
  </div>
</form>
`;

const styles = `
todo-taskform { display: block }
.input-group { display: flex }
.input-group > .form-control { flex-grow: 1 }
.input-group > * { margin-left: 1rem }
`;

@Component({
  tag: 'todo-taskform',
  template,
  styles,
})
export class TaskFormComponent extends HTMLElement {
  @Output('search') onSearch: DomEventEmitter<string>;
  @Output('add') onAdd: DomEventEmitter<string>;
}
