import React,{useState} from 'react';
import {Alert,FlatList,Pressable,ScrollView,Switch,Text,TextInput,View} from 'react-native';
import MapView,{Circle,Marker} from 'react-native-maps';
import {C,MetricCard,NetworkScore,SpeedGauge,s} from '../components';
import {useStore} from '../store/useStore';
import {useMonitor} from '../hooks/useMonitor';
import {networkScore,quality,qColor} from '../utils/scoring';
import {downloadTest,uploadTest} from '../services/SpeedTestService';
import {getPosition} from '../services/LocationService';
const fmt=(m:number|null,kb:boolean)=>m==null?null:kb?Math.round(m*1000):+m.toFixed(1);

export function Dashboard(){
  const {live,setLive,settings,addRecord,addData,dataUsedMB}=useStore();const [busy,setBusy]=useState(false);
  const info=useMonitor(true);
  const score=networkScore(live);const u=settings.kbps?'Kbps':'Mbps';
  const full=async()=>{
    if(dataUsedMB>=settings.dataLimitMB)return Alert.alert('Data limit reached','Raise the limit in Settings.');
    setBusy(true);try{const d=await downloadTest(10e6);addData(d.bytes);setLive({down:d.mbps});
      const up=await uploadTest(3e6);addData(up.bytes);const m={...useStore.getState().live,down:d.mbps,up:up.mbps};setLive(m);
      const sc=networkScore(m),pos=settings.location?await getPosition():null;
      addRecord({...m,id:String(Date.now()),ts:Date.now(),score:sc,quality:quality(sc),...(pos??{})});
    }catch{Alert.alert('Test failed','Check your connection and try again.')}setBusy(false)};
  return <ScrollView style={s.scr}><Text style={s.h}>SignalSpot</Text>
   {info.msg?<Text style={{color:'#f97316',marginBottom:6}}>{info.msg}</Text>:null}
   <SpeedGauge mbps={live.down==null?null:settings.kbps?live.down*1000:live.down} max={settings.kbps?100000:100} unit={u}/>
   <NetworkScore score={score} q={quality(score)}/>
   <View style={s.row}><MetricCard label="Download" value={fmt(live.down,settings.kbps)} unit={u}/><MetricCard label="Upload" value={fmt(live.up,settings.kbps)} unit={u}/>
    <MetricCard label="Ping" value={live.ping!=null?Math.round(live.ping):null} unit="ms"/><MetricCard label="Jitter" value={live.jitter!=null?Math.round(live.jitter):null} unit="ms"/>
    <MetricCard label="Packet loss" value={live.loss!=null?live.loss.toFixed(0):null} unit="%"/><MetricCard label="Signal" value={live.dbm} unit="dBm"/>
    <MetricCard label="Network" value={live.network}/><MetricCard label="Carrier" value={live.operator??null}/></View>
   <Pressable style={s.btn} onPress={full} disabled={busy}><Text style={s.bt}>{busy?'Testing… (uses ~13 MB)':'Start Full Speed Test'}</Text></Pressable>
   <Text style={{color:C.mut,fontSize:11,margin:8}}>Live values use lightweight probes. Speeds fluctuate; results are estimates, not guaranteed carrier performance. N/A means your OS doesn't expose that value.</Text></ScrollView>;
}
export function FindSpot(){
  const [on,setOn]=useState(false);const info=useMonitor(on,true);const {live}=useStore();
  return <View style={s.scr}><Text style={s.h}>Find Best Spot</Text>
   <View style={s.row}><MetricCard label="Current Spot" value={`${info.current}/100`}/><MetricCard label="Best Spot Found" value={`${info.best}/100`}/></View>
   <Text style={{color:info.trend==='weaker'?'#ef4444':'#22c55e',fontSize:18,fontWeight:'700',margin:12}}>{info.msg||'Walk slowly and hold still a few seconds at each spot.'}</Text>
   <Text style={{color:C.mut,marginHorizontal:12}}>Ping {live.ping!=null?Math.round(live.ping):'--'} ms · Signal {live.dbm??'N/A'} dBm · {live.network}</Text>
   <Pressable style={s.btn} onPress={()=>setOn(!on)}><Text style={s.bt}>{on?'Stop':'Start'}</Text></Pressable></View>;
}
export function MapScreen(){
  const recs=useStore(x=>x.records).filter(r=>r.lat!=null);const [sel,setSel]=useState<any>(null);
  return <View style={s.scr}>
   <MapView style={{flex:1,borderRadius:16}} showsUserLocation initialRegion={recs[0]?{latitude:recs[0].lat!,longitude:recs[0].lng!,latitudeDelta:.005,longitudeDelta:.005}:undefined}>
    {recs.map(r=><React.Fragment key={r.id}><Circle center={{latitude:r.lat!,longitude:r.lng!}} radius={25} fillColor={qColor[r.quality]+'55'} strokeWidth={0}/>
     <Marker coordinate={{latitude:r.lat!,longitude:r.lng!}} pinColor={qColor[r.quality]} onPress={()=>setSel(r)}/></React.Fragment>)}</MapView>
   {sel&&<View style={[s.card,{marginTop:8}]}><Text style={s.v}>{sel.name??'Spot'} — {sel.score}/100 {sel.quality}</Text>
    <Text style={s.l}>↓{sel.down?.toFixed(1)??'N/A'} ↑{sel.up?.toFixed(1)??'N/A'} Mbps · {sel.ping!=null?Math.round(sel.ping):'N/A'} ms · {sel.dbm??'N/A'} dBm · {sel.network} · {new Date(sel.ts).toLocaleString()}</Text></View>}
   {!recs.length&&<Text style={{color:C.mut,textAlign:'center',margin:8}}>No located tests yet. Run a test with Location enabled.</Text>}</View>;
}
type Sort='ts'|'down'|'ping'|'dbm'|'score';
const L:Record<Sort,string>={ts:'Newest',down:'Fastest',ping:'Lowest ping',dbm:'Signal',score:'Best Spots'};
export function History(){
  const {records,nameRecord,clear}=useStore();const [k,setK]=useState<Sort>('ts');
  const data=[...records].sort((a,b)=>k==='ping'?(a.ping??1e9)-(b.ping??1e9):k==='ts'?b.ts-a.ts:((b as any)[k]??-1e9)-((a as any)[k]??-1e9));
  return <View style={s.scr}><Text style={s.h}>History & Best Spots</Text>
   <View style={s.row}>{(Object.keys(L) as Sort[]).map(x=><Pressable key={x} onPress={()=>setK(x)} style={{padding:8,margin:2,borderRadius:10,backgroundColor:k===x?'#2563eb':C.card}}><Text style={{color:'#fff'}}>{L[x]}</Text></Pressable>)}</View>
   <FlatList data={data} keyExtractor={r=>r.id} renderItem={({item:r,index})=><View style={s.card}>
    <Text style={s.v}>{index+1}. <Text style={{color:qColor[r.quality]}}>{r.score}/100</Text> · {r.down!=null?r.down.toFixed(1)+' Mbps':'no download test'}</Text>
    <TextInput defaultValue={r.name} placeholder="Name this spot (e.g. Balcony)" placeholderTextColor={C.mut} style={{color:C.tx}} onEndEditing={e=>nameRecord(r.id,e.nativeEvent.text)}/>
    <Text style={s.l}>{new Date(r.ts).toLocaleString()} · ↑{r.up?.toFixed(1)??'N/A'} · {r.ping!=null?Math.round(r.ping):'N/A'} ms · jitter {r.jitter!=null?Math.round(r.jitter):'N/A'} · loss {r.loss!=null?r.loss.toFixed(0):'N/A'}% · {r.dbm??'N/A'} dBm · {r.network}{r.lat?` · ${r.lat.toFixed(4)},${r.lng!.toFixed(4)}`:''}</Text></View>}/>
   <Pressable onPress={clear}><Text style={{color:'#ef4444',textAlign:'center',padding:8}}>Clear history</Text></Pressable></View>;
}
export function Settings(){
  const {settings:st,setSetting,dataUsedMB}=useStore();
  const T=({k,l}:{k:any;l:string})=><View style={[s.card,{flexDirection:'row',justifyContent:'space-between'}]}><Text style={s.v}>{l}</Text><Switch value={(st as any)[k]} onValueChange={v=>setSetting(k,v)}/></View>;
  const Opts=({k,vals,suf}:{k:any;vals:number[];suf:string})=><View style={s.row}>{vals.map(n=><Pressable key={n} onPress={()=>setSetting(k,n)} style={{padding:8,margin:2,backgroundColor:(st as any)[k]===n?'#2563eb':'#243049',borderRadius:8}}><Text style={{color:'#fff'}}>{n}{suf}</Text></Pressable>)}</View>;
  return <ScrollView style={s.scr}><Text style={s.h}>Settings</Text>
   <T k="kbps" l="Use Kbps"/><T k="cellularOnly" l="Cellular-only testing"/><T k="wifiTesting" l="Test on Wi-Fi"/><T k="location" l="Location tracking"/><T k="haptics" l="Haptic feedback"/><T k="sound" l="Sound alerts"/><T k="light" l="Light theme (not yet wired)"/>
   <View style={s.card}><Text style={s.l}>Measurement interval</Text><Opts k="intervalSec" vals={[3,5,10,30]} suf="s"/></View>
   <View style={s.card}><Text style={s.l}>Full-test data limit (session)</Text><Opts k="dataLimitMB" vals={[50,100,500,1000]} suf=" MB"/>
    <Text style={s.v}>Used: {dataUsedMB.toFixed(1)} MB</Text><Text style={s.l}>Live monitoring ≈ 1 KB per probe; a full test ≈ 13 MB.</Text></View></ScrollView>;
}
