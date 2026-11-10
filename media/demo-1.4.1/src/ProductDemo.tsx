import {AbsoluteFill,CanvasImage,staticFile,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
import {Audio} from '@remotion/media';
import data from './demo-data.json';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const ProductDemo=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const time=f/fps;
 const screen=[...data.screens].reverse().find(s=>s.time<=time)||data.screens[0];
 const caption=[...data.captions].reverse().find(c=>c.time<=time)||data.captions[0];
 let x=1300,y=780;
 for(const event of data.events){if(time<event.time-.8)break;const u=interpolate(time,[event.time-.8,event.time-.06],[0,1],clamp);const e=u*u*(3-2*u);x+=(event.x-x)*e;y+=(event.y-y)*e;if(time<event.time)break;}
 const clicked=[...data.events].reverse().find(e=>e.time<=time);const age=clicked?time-clicked.time:100;
 return <AbsoluteFill style={{background:'#eeeae2',fontFamily:'Arial, Helvetica, sans-serif'}}>
  <CanvasImage src={staticFile(screen.file)} style={{position:'absolute',left:80,top:0,width:1760,height:990}}/>
  {clicked&&age<.38?<div style={{position:'absolute',left:80+clicked.x*1.1,top:clicked.y*1.1,width:interpolate(age,[0,.38],[18,62],clamp),height:interpolate(age,[0,.38],[18,62],clamp),translate:'-50% -50%',border:'3px solid #F3C572',borderRadius:'50%',background:'#F3C57228',opacity:1-age/.38}}/>:null}
  <svg width="36" height="46" viewBox="0 0 36 46" style={{position:'absolute',left:80+x*1.1,top:y*1.1,filter:'drop-shadow(0 2px 3px #0008)',scale:age<.14?.86:1,transformOrigin:'top left'}}><path d="M3 2 L3 32 L11 25 L18 40 L24 37 L17 23 L29 23 Z" fill="white" stroke="#292723" strokeWidth="2.5" strokeLinejoin="round"/></svg>
  <div style={{position:'absolute',bottom:0,height:90,left:0,right:0,display:'flex',alignItems:'center',justifyContent:'center',gap:25,color:'#27241F',background:'#F6F3EB'}}><span style={{fontSize:20,letterSpacing:2,textTransform:'uppercase',color:'#746957'}}>{caption.chapter}</span><span style={{width:1,height:24,background:'#D2CBBE'}}/><span style={{fontSize:29}}>{caption.text}</span></div>
  <Audio name="Gentle background music" src={staticFile('audio/gentle-original.wav')} premountFor={fps}/>
  <Audio name="Synchronized mouse clicks" src={staticFile('audio/clicks-synced.wav')} premountFor={fps}/>
 </AbsoluteFill>;
};
