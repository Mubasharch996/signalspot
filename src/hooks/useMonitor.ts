import {useEffect,useRef,useState} from 'react';
import {AppState,Vibration} from 'react-native';
import Haptic from 'react-native-haptic-feedback';
import {useStore} from '../store/useStore';
import {lightProbe,netState} from '../services/NetworkService';
import {getRadio} from '../services/SignalService';
import {getPosition,requestLocation} from '../services/LocationService';
import {networkScore,quality} from '../utils/scoring';
import {BestSpotTracker} from '../utils/bestSpot';
/** Lightweight live monitor (pauses in background). spotMode enables Best Spot tracking + saves. */
export function useMonitor(active:boolean,spotMode=false){
  const {settings,setLive,addRecord}=useStore();
  const [info,setInfo]=useState({current:0,best:0,trend:'steady' as 'warmer'|'weaker'|'steady',newBest:false,offline:false,msg:''});
  const tracker=useRef(new BestSpotTracker());
  useEffect(()=>{
    if(!active)return;let stop=false;let fg=AppState.currentState==='active';
    const sub=AppState.addEventListener('change',s=>{fg=s==='active'});
    tracker.current=new BestSpotTracker();
    (async()=>{
      const locOk=settings.location&&await requestLocation();
      while(!stop){
        if(fg){
          const n=await netState();
          const blocked=n.isWifi&&(settings.cellularOnly||!settings.wifiTesting);
          if(!n.online){setLive({network:'Offline'});setInfo(i=>({...i,offline:true,msg:'You are offline'}))}
          else if(blocked){setInfo(i=>({...i,offline:false,msg:'Paused: Wi-Fi testing disabled in Settings'}))}
          else{
            const [p,radio]=await Promise.all([lightProbe(),getRadio()]);
            const m={...useStore.getState().live,ping:p.ping,jitter:p.jitter,loss:p.loss,dbm:radio.dbm,operator:radio.operator,roaming:radio.roaming,network:n.network};
            setLive(m);
            const score=networkScore(m);
            if(spotMode){
              const r=tracker.current.update(score);
              if(r.newBest&&settings.haptics){Haptic.trigger('notificationSuccess');Vibration.vibrate(200)}
              setInfo({...r,offline:false,msg:r.newBest?'New Best Location Found!':r.trend==='warmer'?"You're getting warmer — connection improving":r.trend==='weaker'?'Signal getting weaker':''});
              if(r.newBest){const pos=locOk?await getPosition():null;
                addRecord({...m,id:String(Date.now()),ts:Date.now(),score,quality:quality(score),...(pos??{})})}
            }else setInfo(i=>({...i,offline:false,msg:''}));
          }
        }
        await new Promise(r=>setTimeout(r,settings.intervalSec*1000));
      }
    })();
    return()=>{stop=true;sub.remove()};
  },[active,spotMode,settings.intervalSec,settings.cellularOnly,settings.wifiTesting,settings.location]);
  return info;
}
