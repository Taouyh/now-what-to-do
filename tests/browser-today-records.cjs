const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const now = '2026-10-21T21:30:00+08:00';
module.exports = async (scenario, fixture) => {
  let count = 0;
  const dataset = size => {
    const data = fixture();
    data.completed=Array.from({length:size},(_,i)=>{
      const startedAt=Date.parse('2026-10-21T19:00:00+08:00')+i*600000,endedAt=startedAt+1813000;
      return {recordId:'rec-'+i,completionId:'rec-'+i,taskId:'task-'+i,taskName:'学习记录 '+i,startedAt,endedAt,completedAt:new Date(endedAt).toISOString(),actualDurationMs:1813000,plannedDuration:30,extensionDurationMs:i===2?900000:0,pausedDurationMs:0,note:'不要改写原记录'};
    });return data;
  };
  const check = async (name,data,fn) => {
    await scenario(name,{whatToDoData:JSON.stringify(data)}, {},async(run,importData,helpers)=>{
      await run(`const RealDate=Date;Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(now)}]))}static now(){return RealDate.parse(${JSON.stringify(now)})}};page('today')`);
      await fn(run,importData,helpers);
    },{timezone:'Asia/Shanghai'});count++;
  };
  const click = async (run,protocol,selector) => {
    const p=await run(`const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}`);
    await protocol('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});
    await protocol('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});
  };
  const screenshot=async(protocol,name)=>{
    if(!process.env.TODAY_SCREENSHOT_DIR)return;
    fs.mkdirSync(process.env.TODAY_SCREENSHOT_DIR,{recursive:true});
    const shot=await protocol('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(process.env.TODAY_SCREENSHOT_DIR,name+'.png'),Buffer.from(shot.data,'base64'));
  };

  for(const size of [1,5,10]) {
    const data=dataset(size);
    await check(size+' records start collapsed, compact and ordered with unchanged totals above the list',data,async(run,_import,{protocol})=>{
      assert.equal(await run("return document.querySelectorAll('.history-item').length"),size);
      assert.ok(await run("return [...document.querySelectorAll('.history-item')].every(e=>!e.open&&e.getBoundingClientRect().height<=120)"));
      assert.deepEqual(await run("return [...document.querySelectorAll('.history-item h3')].map(e=>e.textContent)"),data.completed.map(c=>c.taskName));
      assert.equal(await run("return document.querySelector('.today-overview').textContent"),await run(`return tr(${JSON.stringify(size===1?'做了 1 次，共 {duration}':'做了 {count} 次，共 {duration}')},{count:${size},duration:formatDuration(${size*1813000})})`));
      assert.ok(await run("return document.querySelector('.today-overview').getBoundingClientRect().bottom<document.querySelector('.history-list').getBoundingClientRect().top"));
      assert.equal(await run("return document.querySelector('.history-time').textContent"),'19:00');
      assert.equal(await run("return document.querySelector('.history-duration').textContent"),'30 分钟 13 秒');
      if(size>=5)assert.match(await run("return document.querySelectorAll('.history-record-metrics')[2].textContent"),/追加 15 分钟/);
      assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(data));
      assert.equal(await run('return __writes.length'),0);
      if(size===5){await run('scrollTo(0,0)');await screenshot(protocol,'today-five-records')}
    });
  }

  const grouped=dataset(1);
  const execution=(id,taskId,name,clock,seconds)=>{
    const startedAt=Date.parse('2026-10-21T'+clock+'+08:00'),endedAt=startedAt+seconds*1000;
    return {...grouped.completed[0],recordId:id,completionId:id,taskId,taskName:name,startedAt,endedAt,completedAt:new Date(endedAt).toISOString(),actualDurationMs:seconds*1000};
  };
  grouped.completed=[execution('c3','coding','Vibe Coding','14:20:00',1800),execution('read','reading','读书','12:00:00',900),execution('c2','coding','Vibe Coding','11:10:43',62),execution('stretch','stretch','伸展一下','16:00:00',300),execution('c1','coding','Vibe Coding','11:10:19',3)];
  await check('repeated activities render as one ordered group with per-session details and no view switches or explanatory block',grouped,async(run,_import,{protocol})=>{
    const before=JSON.stringify(grouped);
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item h3')].map(e=>e.textContent)"),['Vibe Coding','读书','伸展一下']);
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-title > .history-duration')].map(e=>e.textContent)"),['31 分钟 5 秒','15 分钟','5 分钟']);
    assert.equal(await run("return document.querySelector('.history-count').textContent"),'3 次');
    assert.equal(await run("return document.querySelector('.history-meta').textContent"),'最近一次 14:20');
    assert.equal(await run("return document.querySelector('.today-overview').textContent"),'做了 5 次，共 51 分钟 5 秒');
    assert.equal(await run("return $('todayBox').querySelectorAll('button:not(.history-more),.segments,.panel-context').length"),0);
    assert.ok(!await run("return $('todayBox').textContent.includes('做了几次，一眼就知道')"));
    await click(run,protocol,'.history-item > summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item:first-child .history-range')].map(e=>e.textContent)"),['11:10:19–11:10:22','11:10–11:11','14:20–14:50']);
    assert.ok(await run("return [...document.querySelectorAll('.history-more-panel')].every(e=>e.hidden)"));
    assert.equal(await run("return $('todayBox').querySelectorAll('.history-session details,.history-session summary,.history-session-index,dl,.history-group-heading').length"),0);
    assert.equal(await run("return document.querySelector('.history-session-duration').textContent"),'3 秒');
    await protocol('Emulation.setDeviceMetricsOverride',{width:1280,height:960,deviceScaleFactor:1,mobile:false});
    await run("document.documentElement.dataset.theme='dark';scrollTo(0,0)");await screenshot(protocol,'today-simple-dark');
    await run("document.documentElement.dataset.theme='light'");await screenshot(protocol,'today-simple-light');
    await protocol('Emulation.setDeviceMetricsOverride',{width:375,height:1050,deviceScaleFactor:1,mobile:true});
    await run("document.documentElement.dataset.theme='dark';scrollTo(0,0)");await screenshot(protocol,'today-simple-mobile');
    assert.ok(await run('return document.documentElement.scrollWidth<=innerWidth'));
    await run("document.querySelector('.history-more').focus()");
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
    await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    assert.equal(await run("return document.querySelector('.history-more').getAttribute('aria-expanded')"),'true');
    assert.ok(await run("const b=document.querySelector('.history-more');return document.getElementById(b.getAttribute('aria-controls'))===document.querySelector('.history-more-panel')&&!document.querySelector('.history-more-panel').hidden"));
    assert.match(await run("return document.querySelector('.history-exact-time').textContent"),/11:10:19.*11:10:22/);
    assert.equal(await run("return document.querySelector('.history-record-metrics').textContent"),'计划 30 分钟');
    await screenshot(protocol,'today-simple-more');
    await click(run,protocol,'.history-session:nth-child(2) .history-more');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-more-panel')].slice(0,3).map(e=>e.hidden)"),[true,false,true]);
    await protocol('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await protocol('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert.ok(await run("return [...document.querySelectorAll('.history-more-panel')].every(e=>e.hidden)&&document.activeElement===document.querySelectorAll('.history-more')[1]"));
    await click(run,protocol,'.history-more');
    await click(run,protocol,'.history-item > summary');
    await run('await new Promise(resolve=>setTimeout(resolve,30))');
    assert.equal(await run('return todayRecordTimers.size'),0);
    assert.ok(await run("return [...document.querySelectorAll('.history-more-panel')].every(e=>e.hidden)"));
    await click(run,protocol,'.history-item > summary');
    assert.ok(await run("return [...document.querySelectorAll('.history-more-panel')].every(e=>e.hidden)"));
    assert.deepEqual(await run('return d.completed'),grouped.completed);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);assert.equal(await run('return __writes.length'),0);
  });

  await check('native disclosure supports independent pointer, keyboard and accessible expanded states',dataset(5),async(run,_import,{protocol})=>{
    const root=await protocol('DOM.getDocument'),node=await protocol('DOM.querySelector',{nodeId:root.root.nodeId,selector:'.history-item summary'});
    const expanded=async()=>{
      const tree=await protocol('Accessibility.getPartialAXTree',{nodeId:node.nodeId});
      return tree.nodes.flatMap(n=>n.properties||[]).find(p=>p.name==='expanded')?.value.value;
    };
    assert.equal(await expanded(),false);
    const closedArrow=await run("return getComputedStyle(document.querySelector('.history-arrow')).transform");
    await click(run,protocol,'.history-item summary');assert.equal(await expanded(),true);
    await run('await new Promise(resolve=>setTimeout(resolve,180))');
    assert.notEqual(await run("return getComputedStyle(document.querySelector('.history-arrow')).transform"),closedArrow);
    await click(run,protocol,'.history-item:nth-child(2) summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,true,false,false,false]);
    await click(run,protocol,'.history-more');
    await click(run,protocol,'.history-exact-time');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,true,false,false,false]);
    await click(run,protocol,'.history-item summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[false,true,false,false,false]);
    await run("document.querySelector('.history-item summary').focus()");
    for(const key of ['Enter',' ']) {
      await protocol('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':'Enter',windowsVirtualKeyCode:key===' '?32:13,text:key===' '? ' ':'\r'});
      await protocol('Input.dispatchKeyEvent',{type:'keyUp',key,code:key===' '?'Space':'Enter',windowsVirtualKeyCode:key===' '?32:13});
      assert.equal(await expanded(),key==='Enter');
    }
    await run("document.querySelector('.history-item').open=true;const link=document.createElement('a');link.href='#today';link.textContent='测试交互';link.addEventListener('click',e=>e.preventDefault());document.querySelector('.history-exact-time').append(link);link.click()");
    assert.equal(await run("return document.querySelector('.history-item').open"),true);
    assert.equal(await run('return __writes.length'),0);
  });

  const reading=dataset(10);
  await check('reading interactions do not immediately collapse records before their timeout',reading,async(run,_import,{protocol})=>{
    const before=await run("return __rawGet('whatToDoData')"),total=await run("return document.querySelector('.today-overview').textContent");
    const states=async()=>assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,true,...Array(8).fill(false)]);
    const mouse=async(type,p,clickCount=1)=>protocol('Input.dispatchMouseEvent',{type,...p,button:'left',buttons:type==='mouseReleased'?0:1,clickCount});
    const point=async selector=>run(`const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+12,y:r.top+r.height/2}`);
    await click(run,protocol,'.history-item summary');await click(run,protocol,'.history-item:nth-child(2) summary');
    await click(run,protocol,'.history-more');
    assert.ok(await run("return [...document.querySelectorAll('.history-session')].every(e=>e.tagName==='DIV'&&e.querySelector('.history-more-panel').parentElement===e&&e.onclick===null)"));
    await click(run,protocol,'.history-exact-time');await states();
    const endSelector='.history-exact-time',p=await point(endSelector);
    for(const n of [1,2]){await mouse('mousePressed',p,n);await mouse('mouseReleased',p,n)}
    assert.ok(await run('return getSelection().toString().length>0'));await states();
    const selection=await run(`getSelection().removeAllRanges();const e=document.querySelector(${JSON.stringify(endSelector)}),range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();return {x:r.left+1,y:r.top+r.height/2,end:r.right-1}`);
    await mouse('mousePressed',{x:selection.x,y:selection.y});
    await mouse('mouseMoved',{x:selection.end,y:selection.y});await mouse('mouseReleased',{x:selection.end,y:selection.y});
    assert.ok(await run('return getSelection().toString().length>0'));await states();
    const blank=await run("const e=document.querySelector('.history-more-panel');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.right-3,y:r.bottom-4}");
    await mouse('mousePressed',blank);await mouse('mouseReleased',blank);await states();
    await click(run,protocol,'.today-overview');await states();
    await run('scrollTo(0,0);await new Promise(requestAnimationFrame)');
    const wheel=await point('.history-more-panel'),scroll=await run('return scrollY');
    await protocol('Input.dispatchMouseEvent',{type:'mouseWheel',...wheel,deltaX:0,deltaY:180});
    await run('await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await run('return scrollY')>scroll);await states();
    await protocol('Emulation.setDeviceMetricsOverride',{width:375,height:700,deviceScaleFactor:1,mobile:true});
    const touch=await point('.history-more-panel'),touchScroll=await run('return scrollY');
    await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1}]});
    await protocol('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x,y:touch.y-100,id:1}]});
    await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await run('await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await run('return scrollY')>touchScroll);await states();
    await click(run,protocol,'.history-item summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[false,true,...Array(8).fill(false)]);
    assert.deepEqual(await run('return d.completed'),reading.completed);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);assert.equal(await run('return __writes.length'),0);
    assert.equal(await run("return document.querySelector('.today-overview').textContent"),total);
  });

  await check('each disclosure automatically collapses after ten real seconds without changing records',dataset(2),async(run,_import,{protocol})=>{
    const before=await run("return __rawGet('whatToDoData')");
    await click(run,protocol,'.history-item summary');
    await run('await new Promise(resolve=>setTimeout(resolve,5000))');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,false]);
    await click(run,protocol,'.history-item:nth-child(2) summary');
    await run('await new Promise(resolve=>setTimeout(resolve,5300))');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[false,true]);
    await click(run,protocol,'.history-item:nth-child(2) .history-more');
    await run('await new Promise(resolve=>setTimeout(resolve,5300))');
    assert.equal(await run("return document.querySelectorAll('.history-item')[1].open"),true);
    assert.equal(await run("return document.querySelectorAll('.history-more-panel')[1].hidden"),false);
    await run('await new Promise(resolve=>setTimeout(resolve,5100))');
    assert.equal(await run("return document.querySelectorAll('.history-item')[1].open"),false);
    assert.equal(await run("return document.querySelectorAll('.history-more-panel')[1].hidden"),true);
    assert.ok(await run("return document.activeElement===document.querySelectorAll('.history-item > summary')[1]"));
    assert.equal(await run('return todayRecordTimers.size'),0);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);
    assert.equal(await run('return __writes.length'),0);
  });

  const boundaries=dataset(4);
  Object.assign(boundaries.completed[0],{startedAt:'2026-10-20T23:50:00+08:00',endedAt:'2026-10-21T00:20:00+08:00',completedAt:'2026-10-21T00:20:00+08:00'});
  delete boundaries.completed[1].startedAt;delete boundaries.completed[1].endedAt;delete boundaries.completed[1].plannedDuration;delete boundaries.completed[1].extensionDurationMs;
  boundaries.completed[1].date=boundaries.completed[1].completedAt;delete boundaries.completed[1].completedAt;
  boundaries.completed[2].startedAt=null;
  Object.assign(boundaries.completed[3],{plannedDuration:null,plannedDurationMs:null,extensionDurationMs:null,extensionDuration:15,pausedDurationMs:'65000'});
  await check('cross-midnight and incomplete legacy times remain explicit without inventing fields',boundaries,async run=>{
    const summaries=await run("return Object.fromEntries([...document.querySelectorAll('.history-item')].map(e=>[e.querySelector('h3').textContent,e.querySelector('.history-range').textContent]))");
    assert.equal(summaries['学习记录 0'],'2026-10-20 23:50–2026-10-21 00:20');
    assert.equal(summaries['学习记录 1'],'开始时间未记录–结束时间未记录');
    assert.match(summaries['学习记录 2'],/^开始时间未记录–2026-10-21 /);
    const details=await run("const card=[...document.querySelectorAll('.history-item')].find(e=>e.querySelector('h3').textContent==='学习记录 1');card.open=true;card.querySelector('.history-more').click();return card.querySelector('.history-more-panel').textContent");
    assert.match(details,/该记录没有保存时间/);assert.match(details,/计划 未知/);assert.match(details,/追加 未记录/);
    const legacy=await run("const card=[...document.querySelectorAll('.history-item')].find(e=>e.querySelector('h3').textContent==='学习记录 3');card.open=true;card.querySelector('.history-more').click();return card.querySelector('.history-more-panel').textContent");
    assert.match(legacy,/计划 未知/);assert.match(legacy,/追加 15 分钟/);assert.match(legacy,/暂停 1 分钟 5 秒/);
    assert.deepEqual(await run('return d.completed'),boundaries.completed);
    assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(boundaries));
  });

  const narrow=dataset(10);narrow.completed[0].taskName='没有空格的很长任务名称<>中文&'.repeat(30);
  await check('long text stays within narrow layouts in collapsed and expanded cards',narrow,async(run,_import,{protocol})=>{
    for(const width of [375,320,240]) {
      await protocol('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:true});
      for(const open of [false,true]) {
        await run(`document.querySelector('.history-item').open=${open};if(${open})document.querySelector('.history-more').click();await new Promise(requestAnimationFrame)`);
        assert.ok(await run("return document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.history-item summary,.history-more,.history-more-panel,.history-arrow')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+.5})"));
        assert.ok(await run("const title=document.querySelector('.history-item h3').getBoundingClientRect(),arrow=document.querySelector('.history-arrow').getBoundingClientRect();return title.right<arrow.left"));
      }
      if(width===320){await run("document.querySelector('.history-item').open=false;scrollTo(0,0)");await screenshot(protocol,'today-narrow')}
    }
  });

  const hostile=dataset(5);hostile.completed[0].taskName='<img data-history-probe src=x onerror="window.__historyExecuted=1"> < > & 中文 \' "';
  await check('imported hostile text, toggling, redraw and real reload preserve history and storage bytes',hostile,async(run,importData,{reload,protocol})=>{
    await importData(hostile);await run("$('confirmAccept').click();page('today')");
    const before=await run("return __rawGet('whatToDoData')");
    await click(run,protocol,'.history-item summary');
    assert.equal(await run("return document.querySelector('.history-item h3').textContent"),hostile.completed[0].taskName);
    for(let i=0;i<3;i++)await run("today();page('tasks');page('today')");
    assert.deepEqual(await run('return d.completed'),hostile.completed);assert.equal(await run("return __rawGet('whatToDoData')"),before);
    await reload();await run("page('today')");
    assert.deepEqual(await run('return d.completed'),hostile.completed);assert.equal(await run("return __rawGet('whatToDoData')"),before);
    assert.deepEqual(await run("return [document.querySelectorAll('[data-history-probe]').length,window.__historyExecuted||0,__writes.length]"),[0,0,0]);
    await screenshot(protocol,'today-special-text');
  });
  console.log(count+' compact-today Chrome scenarios passed.');
};
