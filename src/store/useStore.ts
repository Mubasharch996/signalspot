import {create} from 'zustand';
import {Metrics,Settings,TestRecord} from '../types';
import {loadRecords,loadSettings,saveRecords,saveSettings} from '../database/db';
const defSettings:Settings={kbps:false,intervalSec:5,cellularOnly:false,wifiTesting:true,location:true,haptics:true,sound:false,light:false,dataLimitMB:100};
interface S{live:Metrics;records:TestRecord[];settings:Settings;dataUsedMB:number;
 setLive:(m:Partial<Metrics>)=>void;addRecord:(r:TestRecord)=>void;nameRecord:(id:string,n:string)=>void;clear:()=>void;setSetting:<K extends keyof Settings>(k:K,v:Settings[K])=>void;addData:(b:number)=>void}
export const useStore=create<S>((set,get)=>({
 live:{down:null,up:null,ping:null,jitter:null,loss:null,dbm:null,network:'—'},
 records:loadRecords(),settings:{...defSettings,...loadSettings()},dataUsedMB:0,
 setLive:m=>set(s=>({live:{...s.live,...m}})),
 addRecord:r=>{const rs=[...get().records,r];saveRecords(rs);set({records:rs})},
 nameRecord:(id,n)=>{const rs=get().records.map(r=>r.id===id?{...r,name:n}:r);saveRecords(rs);set({records:rs})},
 clear:()=>{saveRecords([]);set({records:[]})},
 setSetting:(k,v)=>{const s={...get().settings,[k]:v};saveSettings(s);set({settings:s})},
 addData:b=>set(s=>({dataUsedMB:s.dataUsedMB+b/1e6}))}));
