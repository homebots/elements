import { Injectable, Type } from '../injector';

@Injectable()
export class ContainerRegistry extends Map<string, Type> {}
