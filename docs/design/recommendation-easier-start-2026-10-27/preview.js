const gear='<svg class="gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m9 3-.6 2.2-2 .9-2.1-.6-2 3.5 1.6 1.6v2.3L2.3 14l2 3.5 2.1-.6 2 .9L9 20h4l.6-2.2 2-.9 2.1.6 2-3.5-1.6-1.6v-2.3L19.7 9l-2-3.5-2.1.6-2-.9L13 3Z"/><circle cx="11" cy="11.5" r="3"/></svg>';
const edit='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m15.5 4.5 4 4M4 20l4.5-1L20 7.5a2.8 2.8 0 0 0-4-4L4.5 15Z"/></svg>';
const samples=[{name:'读书',step:'翻到上次的位置，先读一页。'},{name:'Vibe Coding',step:'打开项目，先确认一个要改的问题。'},{name:'伸展一下',step:'离开椅子，站起来伸个懒腰。'}];
const states=[];

// The trigger-to-panel gap gets a short grace period. Leaving the panel closes
// immediately; keyboard focus and touch do not activate mouse-only hover.
function hoverPopover(trigger,panel,open,close){
 let exitTimer;
 const cancel=()=>clearTimeout(exitTimer);
 trigger.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){cancel();open()}});
 trigger.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='mouse'||panel.contains(event.relatedTarget))return;
  cancel();exitTimer=setTimeout(()=>{if(!trigger.matches(':hover')&&!panel.matches(':hover'))close()},160);
 });
 panel.addEventListener('pointerenter',cancel);
 panel.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='mouse')return;
  cancel();if(!trigger.contains(event.relatedTarget))close();
 });
 return cancel;
}

function setMenu(s,open){
 const menu=s.root.querySelector('.menu'),trigger=s.root.querySelector('.more');
 s.menu=!!open;
 if(!menu||!trigger)return;
 if(open)s.root.querySelectorAll('.picker').forEach(picker=>picker.open=false);
 if(!open&&menu.contains(document.activeElement))trigger.focus({preventScroll:true});
 menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
}
function bindPickers(s){
 for(const picker of s.root.querySelectorAll('.picker')){
  const trigger=picker.querySelector('summary'),panel=picker.querySelector('.picker-panel');
  hoverPopover(trigger,panel,()=>{
   setMenu(s,false);
   s.root.querySelectorAll('.picker').forEach(other=>{if(other!==picker)other.open=false});
   picker.open=true;
  },()=>picker.open=false);
  trigger.addEventListener('click',event=>{if(event.pointerType==='mouse'&&picker.open)event.preventDefault()});
 }
}
function initialize(){
 for(const s of states){clearTimeout(s.toastTimer);s.cancelHover?.()}
 for(const [i,root] of [...document.querySelectorAll('[data-demo]')].entries()){
  root.innerHTML='<div class="app-header"><span class="brand">Now What</span><div class="nav"><span class="active">开始</span><span>我的活动</span><span>今天</span></div>'+gear+'</div><div class="workspace"><div class="controls"><details class="picker"><summary><span class="time-value">15 分钟</span><i class="chevron"></i></summary><div class="picker-panel times">'+[5,10,15,30,60].map(n=>'<button type="button" data-time="'+n+'" class="'+(n===15?'selected':'')+'">'+n+' 分钟</button>').join('')+'<button type="button" data-time="custom">自定义</button></div></details><details class="picker"><summary>当前条件<i class="chevron"></i></summary><div class="picker-panel">'+['方便使用电脑','方便听音频','方便出声','可能随时被打断'].map(x=>'<label>'+x+'<input type="checkbox"></label>').join('')+'</div></details></div><div class="card"></div><button type="button" class="choose">自己选</button><div class="toast" role="status" hidden></div></div>';
  const state={root,items:samples.map(x=>({...x})),index:i,seen:new Set([i]),menu:i===1,editing:i===0};states[i]=state;
  root.onclick=event=>act(state,event);root.querySelector('.choose').onclick=()=>showChoices(state);
  bindPickers(state);render(state);
 }
}
function render(s){
 s.cancelHover?.();
 const card=s.root.querySelector('.card'),item=s.items[s.index];
 card.classList.toggle('editing',s.editing);
 if(!item){card.innerHTML='<div class="empty"><h2>这轮先到这里</h2><p>暂时没有想做的，也没关系。</p><button class="secondary" type="button" data-action="choose">自己选一件</button><button class="change" type="button" data-action="reset">重新看看</button></div>';s.root.querySelector('.choose').hidden=true;return}
 s.root.querySelector('.choose').hidden=false;
 const id=s.root.dataset.demo;
 card.innerHTML='<div class="more-area"><button id="more-'+id+'" class="more" type="button" aria-label="更多" aria-haspopup="menu" aria-controls="menu-'+id+'" aria-expanded="'+s.menu+'" data-action="menu">⋯</button><div id="menu-'+id+'" class="menu" role="menu" aria-labelledby="more-'+id+'" '+(s.menu?'':'hidden')+'><button type="button" role="menuitem" data-action="edit">'+edit+'修改下一步</button></div></div><h2></h2><div class="step"><div class="step-label">下一步</div><p class="step-copy"></p></div><form class="step-editor" '+(s.editing?'':'hidden')+'><label for="step-'+id+'">下一步<span>（可选）</span></label><input id="step-'+id+'" maxlength="200" placeholder="从哪一小步开始？"><div class="editor-actions"><button type="button" class="cancel-step" data-action="cancel-edit">取消</button><button class="save-step" type="submit">保存</button></div></form><button class="start" type="button" data-action="start" '+(s.editing?'hidden':'')+'><span class="play" aria-hidden="true"></span>开始</button><button class="change" type="button" data-action="change" '+(s.editing?'hidden':'')+'>换一件</button>';
 card.querySelector('h2').textContent=item.name;card.querySelector('.step-copy').textContent=item.step;card.querySelector('.step').hidden=s.editing||!item.step;
 const form=card.querySelector('form');form.querySelector('input').value=item.step;
 form.onsubmit=event=>{event.preventDefault();item.step=form.querySelector('input').value.trim();s.editing=false;render(s);s.root.querySelector('[data-action=start]').focus({preventScroll:true})};
 s.cancelHover=hoverPopover(card.querySelector('.more'),card.querySelector('.menu'),()=>setMenu(s,true),()=>setMenu(s,false));
 if(s.editing)form.querySelector('input').focus({preventScroll:true});
}
function next(s){const index=s.items.findIndex((_,i)=>!s.seen.has(i));s.index=index;if(index>=0)s.seen.add(index);s.menu=false;s.editing=false;render(s)}
function showChoices(s){s.cancelHover?.();const card=s.root.querySelector('.card');s.menu=false;card.innerHTML='<div class="empty"><h2>此刻想做哪件？</h2><ul class="activity-choice"></ul></div>';const list=card.querySelector('ul');s.items.forEach((item,i)=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=item.name;button.onclick=()=>{s.index=i;s.seen.add(i);s.editing=false;render(s)};li.append(button);list.append(li)})}
function act(s,event){
 const time=event.target.closest('[data-time]');if(time){const value=time.dataset.time;if(value==='custom'){const n=prompt('本次可用时间（分钟）','20');if(!n||!Number.isInteger(+n)||+n<1)return;s.root.querySelector('.time-value').textContent=n+' 分钟'}else s.root.querySelector('.time-value').textContent=value+' 分钟';time.closest('details').open=false;return}
 const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
 if(action==='menu'){
  const mouse=event.pointerType==='mouse'&&event.detail>0;
  setMenu(s,mouse?true:!s.menu);
  if(s.menu&&!mouse)s.root.querySelector('.menu button').focus({preventScroll:true});
 }
 if(action==='edit'){s.menu=false;s.editing=true;render(s)}
 if(action==='cancel-edit'){s.menu=false;s.editing=false;render(s);s.root.querySelector('.more').focus({preventScroll:true})}
 if(action==='change')next(s);
 if(action==='choose')showChoices(s);
 if(action==='reset'){s.seen=new Set();next(s)}
 if(action==='start'){const toast=s.root.querySelector('.toast');toast.textContent='产品概念预览：开始本次活动';toast.hidden=false;clearTimeout(s.toastTimer);s.toastTimer=setTimeout(()=>toast.hidden=true,2400)}
}
document.getElementById('reset').onclick=initialize;
document.addEventListener('pointerdown',event=>{
 for(const s of states){
  if(!s.root.querySelector('.more-area')?.contains(event.target))setMenu(s,false);
  for(const picker of s.root.querySelectorAll('.picker'))if(!picker.contains(event.target))picker.open=false;
 }
});
document.addEventListener('keydown',event=>{
 const s=states.find(s=>s.root.contains(event.target));if(!s)return;
 if(event.key==='Escape'){
  if(s.menu){setMenu(s,false);s.root.querySelector('.more')?.focus({preventScroll:true});event.preventDefault();return}
  for(const picker of s.root.querySelectorAll('.picker'))if(picker.open){picker.open=false;picker.querySelector('summary').focus({preventScroll:true});event.preventDefault()}
 }
 if(s.menu&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
  const buttons=[...s.root.querySelectorAll('.menu button')],index=buttons.indexOf(document.activeElement);
  const nextIndex=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
  buttons[nextIndex].focus({preventScroll:true});event.preventDefault();
 }
});
document.addEventListener('focusin',event=>{for(const s of states)if(!s.root.querySelector('.more-area')?.contains(event.target))setMenu(s,false)});
initialize();
