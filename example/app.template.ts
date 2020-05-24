export default `
  <div>
    <h2>App root</h2>
    <p>Hello, <span [innerText]="this.name"></span></p>
    <button (click)="this.updateName()"></button>
  </div>
`;
