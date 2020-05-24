import 'zone.js/dist/zone.js';
import { InjectionToken } from './injector';

export const ZoneSymbol = Symbol('ZoneRef');
export const ZoneRef: InjectionToken<Zone> = ZoneSymbol;
