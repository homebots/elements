import { Class, Injectable } from '@homebots/injector';

@Injectable()
export class ContainerRegistry extends Map<string, Class> {}
