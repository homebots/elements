import { wait } from '../../src/testing';
import { Injector } from '@homebots/injector';
import { Bootstrap, Application, ShadowDomToggle, domReady } from '../../src/index';
import './todo-app';

beforeAll(() => Injector.global.get(ShadowDomToggle).disable());

class TodoInteractor {
  get taskInput() {
    return this.$.querySelector('input')!;
  }

  get okButton() {
    return this.$.querySelector<HTMLButtonElement>('button[type=submit]')!;
  }

  get tasks() {
    return Array.from(this.$.querySelectorAll('li'));
  }

  get taskNames() {
    return this.tasks.map((task) => String(task.querySelector('span')!.textContent).trim());
  }

  async whenReady() {
    await this.app.check();
    return await wait(1);
  }

  constructor(protected $: HTMLElement, protected app: Application) {}

  async addTask(task: string) {
    this.taskInput.value = task;
    this.taskInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.okButton.click();
    return this.whenReady();
  }

  removeTask(task: string) {
    const taskNode = this.tasks.find((node) => node.innerText.trim().includes(task));
    taskNode!.querySelector('button')!.click();
    return this.whenReady();
  }
}

fdescribe('todo app', () => {
  async function setup() {
    await domReady();
    const element = document.createElement('todo-app');
    const app = Bootstrap.createApplication(element);
    const interactor = new TodoInteractor(element, app);

    document.body.appendChild(element);

    return { element, app, interactor };
  }

  it('shows a list of tasks', async () => {
    const { interactor, element } = await setup();
    debugger;
    console.log(element);

    await interactor.whenReady();
    console.log(element);

    expect(interactor.okButton.disabled).toBe(true);

    await interactor.addTask('Task 1');
    await interactor.addTask('Task 2');
    expect(interactor.taskNames).toEqual(['Task 1', 'Task 2']);

    await interactor.removeTask('Task 2');
    expect(interactor.taskNames).toEqual(['Task 1']);
  });
});
