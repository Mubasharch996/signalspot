import React,{useEffect,useRef} from 'react';
import {Animated,Text,View,StyleSheet} from 'react-native';
import Svg,{Circle} from 'react-native-svg';
import {Quality} from '../types';
import {qColor} from '../utils/scoring';
export const C={bg:'#0b1220',card:'#141c2e',tx:'#e8edf7',mut:'#8392ad'};
const AC=Animated.createAnimatedComponent(Circle);
/** Animated 270° gauge; value smoothly animates to each new reading. */
export function SpeedGauge({mbps,max=100,unit='Mbps'}:{mbps:number|null;max?:number;unit?:string}){
  const v=useRef(new Animated.Value(0)).current;const R=90,L=2*Math.PI*R*0.75;
  useEffect(()=>{Animated.timing(v,{toValue:Math.min((mbps??0)/max,1),duration:600,useNativeDriver:false}).start()},[mbps]);
  return <View style={{alignItems:'center'}}><Svg width={220} height={220} viewBox="0 0 220 220" rotation={135} originX={110} originY={110}>
   <Circle cx={110} cy={110} r={R} stroke="#243049" strokeWidth={16} fill="none" strokeDasharray={`${L} 999`} strokeLinecap="round"/>
   <AC cx={110} cy={110} r={R} stroke="#38bdf8" strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={`${L} 999`} strokeDashoffset={v.interpolate({inputRange:[0,1],outputRange:[L,0]}) as any}/></Svg>
   <View style={{position:'absolute',top:78,alignItems:'center'}}><Text style={{color:C.tx,fontSize:40,fontWeight:'800'}}>{mbps==null?'--':mbps.toFixed(1)}</Text><Text style={{color:C.mut}}>{unit}</Text></View></View>;
}
export const MetricCard=({label,value,unit}:{label:string;value:string|number|null;unit?:string})=>
  <View style={s.card}><Text style={s.l}>{label}</Text><Text style={s.v}>{value==null?'N/A':value}<Text style={s.l}> {value==null?'':unit}</Text></Text></View>;
export const NetworkScore=({score,q}:{score:number;q:Quality})=>
  <View style={[s.card,{borderColor:qColor[q],borderWidth:1,width:'100%'}]}><Text style={{color:qColor[q],fontSize:20,fontWeight:'800'}}>Network Score: {score}/100 — {q}</Text></View>;
export const s=StyleSheet.create({
  card:{backgroundColor:C.card,borderRadius:16,padding:14,margin:4,flexGrow:1,minWidth:'44%'},
  l:{color:C.mut,fontSize:12},v:{color:C.tx,fontSize:20,fontWeight:'700'},
  scr:{flex:1,backgroundColor:C.bg,padding:12},btn:{backgroundColor:'#2563eb',padding:14,borderRadius:14,alignItems:'center',margin:4},
  bt:{color:'#fff',fontWeight:'700'},h:{color:C.tx,fontSize:22,fontWeight:'800',marginVertical:8},row:{flexDirection:'row',flexWrap:'wrap'}});
