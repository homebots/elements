import { Injectable } from './injector';

export interface Container {
  createView(data: any);
}

@Injectable()
export class IfContainer {
  constructor() {}
}
