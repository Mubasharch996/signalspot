import NetInfo from '@react-native-community/netinfo';
const BASE='https://speed.cloudflare.com/__down';
const nc=()=>`&r=${Date.now()}${Math.random()}`;
const H={'Cache-Control':'no-cache, no-store',Pragma:'no-cache'};
const median=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
/** Lightweight probe: N tiny requests -> median latency, jitter, loss. ~1 KB total. */
export async function lightProbe(n=6,timeout=3000){
  const t:number[]=[];let lost=0;
  for(let i=0;i<n;i++){
    const c=new AbortController();const to=setTimeout(()=>c.abort(),timeout);const s=Date.now();
    try{const r=await fetch(`${BASE}?bytes=0${nc()}`,{headers:H,cache:'no-store',signal:c.signal});if(!r.ok)throw 0;t.push(Date.now()-s)}catch{lost++}
    clearTimeout(to);
  }
  if(!t.length)return{ping:null,jitter:null,loss:100};
  const jitter=t.length>1?t.slice(1).reduce((a,v,i)=>a+Math.abs(v-t[i]),0)/(t.length-1):0;
  return{ping:median(t),jitter,loss:lost/n*100};
}
export async function netState(){
  const s=await NetInfo.fetch();
  const network=s.type==='wifi'?'Wi-Fi':s.type==='cellular'?((s.details as any)?.cellularGeneration?.toUpperCase()??'Cellular'):s.type==='none'?'Offline':s.type;
  return{online:!!s.isConnected&&s.isInternetReachable!==false,isWifi:s.type==='wifi',isCellular:s.type==='cellular',network};
}
