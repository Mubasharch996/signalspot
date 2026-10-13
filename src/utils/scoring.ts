import {Metrics,Quality} from '../types';
const lerp=(v:number,bad:number,good:number)=>Math.max(0,Math.min(1,(v-bad)/(good-bad)));
/** Weighted 0-100 score. Missing metrics are skipped and weights renormalised (never faked). */
export function networkScore(m:Metrics):number{
  const parts:[number|null,number][]=[
    [m.down==null?null:lerp(m.down,1,50),0.30],
    [m.up==null?null:lerp(m.up,0.5,15),0.10],
    [m.ping==null?null:1-lerp(m.ping,20,300),0.25],
    [m.jitter==null?null:1-lerp(m.jitter,5,100),0.10],
    [m.loss==null?null:1-lerp(m.loss,0,10),0.15],
    [m.dbm==null?null:lerp(m.dbm,-120,-70),0.10]];
  let s=0,w=0;for(const[v,wt]of parts)if(v!=null){s+=v*wt;w+=wt}
  return w?Math.round(s/w*100):0;
}
export const quality=(s:number):Quality=>s>=80?'Excellent':s>=60?'Good':s>=35?'Fair':'Poor';
export const qColor:Record<Quality,string>={Poor:'#ef4444',Fair:'#f97316',Good:'#eab308',Excellent:'#22c55e'};
