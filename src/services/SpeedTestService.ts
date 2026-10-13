const H={'Cache-Control':'no-cache, no-store'};
/** Real transfer. Returns Mbps and bytes used (for data-usage estimate). */
export async function downloadTest(bytes=10_000_000){
  const s=Date.now();
  const r=await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}&r=${Date.now()}`,{headers:H,cache:'no-store'});
  const buf=await r.arrayBuffer();const sec=(Date.now()-s)/1000;
  return{mbps:buf.byteLength*8/sec/1e6,bytes:buf.byteLength};
}
export async function uploadTest(bytes=3_000_000){
  const body=new Uint8Array(bytes).map((_,i)=>i%251);const s=Date.now();
  await fetch(`https://speed.cloudflare.com/__up?r=${Date.now()}`,{method:'POST',headers:{...H,'Content-Type':'application/octet-stream'},body});
  return{mbps:bytes*8/((Date.now()-s)/1000)/1e6,bytes};
}
