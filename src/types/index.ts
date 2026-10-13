export type Quality='Poor'|'Fair'|'Good'|'Excellent';
export interface Metrics{down:number|null;up:number|null;ping:number|null;jitter:number|null;loss:number|null;dbm:number|null;network:string;operator?:string|null;roaming?:boolean|null}
export interface TestRecord extends Metrics{id:string;ts:number;score:number;quality:Quality;lat?:number;lng?:number;name?:string}
export interface Settings{kbps:boolean;intervalSec:number;cellularOnly:boolean;wifiTesting:boolean;location:boolean;haptics:boolean;sound:boolean;light:boolean;dataLimitMB:number}
