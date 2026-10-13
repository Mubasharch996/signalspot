import {MMKV} from 'react-native-mmkv';
import {TestRecord} from '../types';
const kv=new MMKV({id:'signalspot'});
export const loadRecords=():TestRecord[]=>{try{return JSON.parse(kv.getString('records')??'[]')}catch{return[]}};
export const saveRecords=(r:TestRecord[])=>kv.set('records',JSON.stringify(r.slice(-2000)));
export const loadSettings=()=>{try{return JSON.parse(kv.getString('settings')??'null')}catch{return null}};
export const saveSettings=(s:unknown)=>kv.set('settings',JSON.stringify(s));
