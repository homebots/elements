export default `
  <div>
    <h2>App root</h2>
    <label for="name">Your name:</label>

    <input id="name" [value]="this.name" (input)="this.name = $event.target.value" />
    <p>Hello, <span [innerText]="this.name"></span></p>

    <button (click)="this.updateName()">change to random name</button>
  </div>
`;
