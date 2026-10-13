/** Smooths scores (EMA) to avoid jitter, then compares against best and trend. */
export class BestSpotTracker{
  best=0;ema:number|null=null;recent:number[]=[];
  update(score:number){
    this.ema=this.ema==null?score:this.ema*0.6+score*0.4;
    this.recent=[...this.recent.slice(-4),this.ema];
    const newBest=this.ema>this.best+5; // "significantly" better
    if(this.ema>this.best)this.best=this.ema;
    const d=this.recent.length>=3?this.recent[this.recent.length-1]-this.recent[0]:0;
    const trend:'warmer'|'weaker'|'steady'=d>4?'warmer':d<-4?'weaker':'steady';
    return{current:Math.round(this.ema),best:Math.round(this.best),newBest,trend};
  }
}
