import { createElement, wait } from '../../src/testing';
import { Injector } from '@homebots/injector';
import { Bootstrap, ShadowDomToggle } from '../../src/index';
import './todo-app';

beforeAll(() => Injector.global.get(ShadowDomToggle).disable());

class TodoInteractor {
  private taskInput = this.$.querySelector('input')!;
  private okButton = this.$.querySelector('button')!;

  constructor(protected $: HTMLElement) {}

  get tasks() {
    return Array.from(this.$.querySelectorAll('li'));
  }

  addTask(task: string) {
    this.taskInput.value = task;
    this.okButton.click();
  }

  removeTask(task: string) {
    const taskNode = this.tasks.find((node) => node.innerText.trim() === task);
    taskNode!.querySelector('button')!.click();
  }
}

fdescribe('todo app', () => {
  function setup() {
    const element = createElement('todo-app');
    const app = Bootstrap.createApplication(element);
    const interactor = new TodoInteractor(element);

    return { element, app, interactor };
  }

  it('shows a list of tasks', async () => {
    const { element, interactor, app } = setup();
    await app.check();
    await wait(10);
    debugger;
    expect(element.querySelector<HTMLButtonElement>('form button')?.disabled).toBe(true);

    interactor.addTask('Task 1');
    interactor.addTask('Task 2');

    await app.check();
    await wait(10);

    const tasks = interactor.tasks.map((task) => String(task.textContent).trim());
    expect(tasks).toEqual(['Task 1', 'Task 2']);

    interactor.removeTask('Task 2');

    expect(tasks).toEqual(['Task 1']);
  });
});
