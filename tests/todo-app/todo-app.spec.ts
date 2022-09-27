import { Application, Bootstrap, domReady } from '../../src/index';
import { wait } from '../../src/testing';
import './todo-app';

class TodoInteractor {
  get taskInput() {
    return this.$.querySelector('input')!;
  }

  get okButton() {
    return this.$.querySelector<HTMLButtonElement>('button')!;
  }

  get tasks() {
    return Array.from(this.$.querySelectorAll('li'));
  }

  get taskNames() {
    return this.tasks.map((task) => String(task.querySelector('span')!.textContent).trim());
  }

  async whenReady() {
    await this.app.check();
    return await wait(10);
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

xdescribe('todo app', () => {
  async function setup() {
    await domReady();
    const element = document.createElement('todo-app');
    const app = Bootstrap.createApplication(element);
    const interactor = new TodoInteractor(element, app);

    document.body.appendChild(element);

    return { element, app, interactor };
  }

  it('shows a list of tasks', async () => {
    const { interactor } = await setup();
    await interactor.whenReady();

    expect(customElements.get('todo-app')).not.toBe(undefined);
    expect(interactor.okButton?.disabled).toBe(true);

    await interactor.addTask('Task 1');
    await interactor.addTask('Task 2');
    expect(interactor.taskNames).toEqual(['Task 1', 'Task 2']);

    await interactor.removeTask('Task 2');
    expect(interactor.taskNames).toEqual(['Task 1']);
  });
});
