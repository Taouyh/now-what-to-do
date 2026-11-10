import json,wave
from pathlib import Path
import numpy as np
root=Path(__file__).parent
meta=json.loads((root/'src/demo-data.json').read_text(encoding='utf-8'))
sr=48000; duration=meta['duration']; n=duration*sr
music=np.zeros((n,2),np.float64)
def note(at,midi,length=4,amp=.1,pan=0):
 start=int(at*sr);t=np.arange(int(length*sr))/sr;freq=440*2**((midi-69)/12)
 env=(1-np.exp(-t/0.025))*np.exp(-t/1.45)*np.minimum(1,(length-t)/.15)
 tone=amp*env*(np.sin(2*np.pi*freq*t)+.18*np.exp(-t*2)*np.sin(2*np.pi*freq*2*t)+.035*np.sin(2*np.pi*freq*3*t))
 for delay,gain in [(0,1),(.21,.16),(.39,.09),(.63,.05)]:
  offset=start+int(delay*sr);end=min(n,offset+len(tone));size=end-offset
  if size>0:music[offset:end,0]+=tone[:size]*gain*(.7-pan*.25);music[offset:end,1]+=tone[:size]*gain*(.7+pan*.25)
chords=[[50,57,61,64,69],[47,54,57,62,66],[43,55,59,62,69],[45,57,61,64,71]]
for bar,start in enumerate(np.arange(0,duration,6.4)):
 chord=chords[bar%4];note(start,chord[0],6,.08,-.3)
 for i,j in enumerate([1,2,3,4,3,2,4,2]):note(start+i*.8,chord[j]+(12 if i==6 else 0),4,.045,.5*np.sin(i))
music*=.095/max(np.max(np.abs(music)),1e-9)
fade=np.minimum(1,np.arange(n)/sr/2)*np.minimum(1,(n-np.arange(n))/sr/3)
duck=np.ones(n)
clicks=np.zeros((n,2));rng=np.random.default_rng(30)
for event in meta['events']:
 pos=int(event['time']*sr);t=np.arange(int(.12*sr))/sr
 noise=rng.normal(0,1,len(t));noise=np.convolve(noise,[.2,.6,.2],mode='same')
 click=.18*noise*np.exp(-t/0.005)+.19*np.sin(2*np.pi*1350*t)*np.exp(-t/.012)+.12*np.sin(2*np.pi*490*t)*np.exp(-t/.02)
 click*=np.minimum(1,t/.0008)
 length=min(len(click),n-pos);clicks[pos:pos+length,:]+=click[:length,None]
 a=max(0,pos-int(.04*sr));b=min(n,pos+int(.35*sr));dt=(np.arange(a,b)-pos)/sr
 curve=1-.64*np.exp(-np.maximum(dt,0)/.12);curve[dt<0]=1-.64*(dt[dt<0]+.04)/.04
 duck[a:b]=np.minimum(duck[a:b],curve)
music*=fade[:,None]*duck[:,None]
out=root/'public/audio';out.mkdir(exist_ok=True)
def save(name,data):
 with wave.open(str(out/name),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
save('gentle-original.wav',music);save('clicks-synced.wav',clicks)
print(json.dumps({'duration':duration,'clicks':len(meta['events']),'music_peak_db':float(20*np.log10(np.max(np.abs(music)))),'click_peak_db':float(20*np.log10(np.max(np.abs(clicks)))),'mixed_peak':float(np.max(np.abs(music+clicks)))},indent=2))
