import { Injectable } from '@homebots/injector';

export class Task {
  done: boolean = false;
  name: string;

  constructor(task: string);
  constructor(task: Task);
  constructor(name: string | Task) {
    if (typeof name === 'string') {
      this.name = name;
      return;
    }

    Object.assign(this, name);
  }
}

@Injectable()
export class TaskService {
  private items: Task[] = [];

  get tasks() {
    return this.items;
  }

  constructor() {
    // const db = localStorage.getItem('todo');
    // if (db) {
    //   this.items = JSON.parse(db).map((data) => new Task(data));
    // }
  }

  add(task: string) {
    const alreadyExists = this.find(task);

    if (alreadyExists) {
      return;
    }

    this.items = [new Task(task), ...this.items];
    this.save();
  }

  remove(task: string) {
    this.items = this.items.filter((k) => k.name !== task);
    this.save();
  }

  complete(taskName: string) {
    const task = this.tasks.find((t) => t.name === taskName);

    if (task) {
      task.done = !task.done;
      this.items = [...this.items];
      this.save();
    }
  }

  protected find(taskName: string) {
    return this.items.find((task) => task.name === taskName);
  }

  private save() {
    this.items.sort((a, _) => (a.done ? 1 : -1));
    // localStorage.setItem('todo', JSON.stringify(this.items));
  }
}
