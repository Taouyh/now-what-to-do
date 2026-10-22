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
      assert.ok(await run("return [...document.querySelectorAll('.history-item')].every(e=>!e.open&&e.getBoundingClientRect().height<=100)"));
      assert.deepEqual(await run("return [...document.querySelectorAll('.history-item h3')].map(e=>e.textContent)"),data.completed.map(c=>c.taskName));
      assert.equal(await run("return document.querySelector('.today-overview strong').textContent"),await run(`return formatDuration(${size*1813000})`));
      assert.match(await run("return document.querySelector('.today-overview').textContent"),new RegExp('今日完成 · '+size+' 次执行'));
      assert.ok(await run("return document.querySelector('.today-overview').getBoundingClientRect().bottom<document.querySelector('.history-list').getBoundingClientRect().top"));
      assert.match(await run("return document.querySelector('.history-item summary').textContent"),/19:00–19:30.*有效 30 分 13 秒/);
      if(size>=5)assert.equal(await run("return document.querySelector('.history-extension').textContent"),'+15 分');
      assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(data));
      assert.equal(await run('return __writes.length'),0);
      if(size===5){await run('scrollTo(0,0)');await screenshot(protocol,'today-five-records')}
    });
  }

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
    await click(run,protocol,'.history-item dl dd');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,true,false,false,false]);
    await click(run,protocol,'.history-item summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[false,true,false,false,false]);
    await run("document.querySelector('.history-item summary').focus()");
    for(const key of ['Enter',' ']) {
      await protocol('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':'Enter',windowsVirtualKeyCode:key===' '?32:13,text:key===' '? ' ':'\r'});
      await protocol('Input.dispatchKeyEvent',{type:'keyUp',key,code:key===' '?'Space':'Enter',windowsVirtualKeyCode:key===' '?32:13});
      assert.equal(await expanded(),key==='Enter');
    }
    await run("document.querySelector('.history-item').open=true;const link=document.createElement('a');link.href='#today';link.textContent='测试交互';link.addEventListener('click',e=>e.preventDefault());document.querySelector('.history-item dd').append(link);link.click()");
    assert.equal(await run("return document.querySelector('.history-item').open"),true);
    assert.equal(await run('return __writes.length'),0);
  });

  const reading=dataset(10);
  await check('details clicks, double-clicks, selection, whitespace, outside clicks and scrolling never collapse records',reading,async(run,_import,{protocol})=>{
    const before=await run("return __rawGet('whatToDoData')"),total=await run("return document.querySelector('.today-overview strong').textContent");
    const states=async()=>assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[true,true,...Array(8).fill(false)]);
    const mouse=async(type,p,clickCount=1)=>protocol('Input.dispatchMouseEvent',{type,...p,button:'left',buttons:type==='mouseReleased'?0:1,clickCount});
    const point=async selector=>run(`const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+12,y:r.top+r.height/2}`);
    await click(run,protocol,'.history-item summary');await click(run,protocol,'.history-item:nth-child(2) summary');
    assert.ok(await run("return [...document.querySelectorAll('.history-item')].every(e=>e.firstElementChild.tagName==='SUMMARY'&&e.querySelector('dl').parentElement===e&&!e.querySelector('summary').contains(e.querySelector('dl'))&&e.onclick===null)"));
    await click(run,protocol,'.history-item dl div:first-child dd');await states();
    const endSelector='.history-item dl div:nth-child(2) dd',p=await point(endSelector);
    for(const n of [1,2]){await mouse('mousePressed',p,n);await mouse('mouseReleased',p,n)}
    assert.ok(await run('return getSelection().toString().length>0'));await states();
    const selection=await run(`getSelection().removeAllRanges();const e=document.querySelector(${JSON.stringify(endSelector)}),range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();return {x:r.left+1,y:r.top+r.height/2,end:r.right-1}`);
    await mouse('mousePressed',{x:selection.x,y:selection.y});
    await mouse('mouseMoved',{x:selection.end,y:selection.y});await mouse('mouseReleased',{x:selection.end,y:selection.y});
    assert.ok(await run('return getSelection().toString().length>0'));await states();
    const blank=await run("const e=document.querySelector('.history-item dl');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.right-3,y:r.bottom-4}");
    await mouse('mousePressed',blank);await mouse('mouseReleased',blank);await states();
    await click(run,protocol,'.today-overview');await states();
    await run('scrollTo(0,0);await new Promise(requestAnimationFrame)');
    const wheel=await point('.history-item dl'),scroll=await run('return scrollY');
    await protocol('Input.dispatchMouseEvent',{type:'mouseWheel',...wheel,deltaX:0,deltaY:180});
    await run('await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await run('return scrollY')>scroll);await states();
    await protocol('Emulation.setDeviceMetricsOverride',{width:375,height:700,deviceScaleFactor:1,mobile:true});
    const touch=await point('.history-item dl'),touchScroll=await run('return scrollY');
    await protocol('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1}]});
    await protocol('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x,y:touch.y-100,id:1}]});
    await protocol('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await run('await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await run('return scrollY')>touchScroll);await states();
    await click(run,protocol,'.history-item summary');
    assert.deepEqual(await run("return [...document.querySelectorAll('.history-item')].map(e=>e.open)"),[false,true,...Array(8).fill(false)]);
    assert.deepEqual(await run('return d.completed'),reading.completed);
    assert.equal(await run("return __rawGet('whatToDoData')"),before);assert.equal(await run('return __writes.length'),0);
    assert.equal(await run("return document.querySelector('.today-overview strong').textContent"),total);
  });

  const boundaries=dataset(4);
  Object.assign(boundaries.completed[0],{startedAt:'2026-10-20T23:50:00+08:00',endedAt:'2026-10-21T00:20:00+08:00',completedAt:'2026-10-21T00:20:00+08:00'});
  delete boundaries.completed[1].startedAt;delete boundaries.completed[1].endedAt;delete boundaries.completed[1].plannedDuration;delete boundaries.completed[1].extensionDurationMs;
  boundaries.completed[1].date=boundaries.completed[1].completedAt;delete boundaries.completed[1].completedAt;
  boundaries.completed[2].startedAt=null;
  Object.assign(boundaries.completed[3],{plannedDuration:null,plannedDurationMs:null,extensionDurationMs:null,extensionDuration:15,pausedDurationMs:'65000'});
  await check('cross-midnight and incomplete legacy times remain explicit without inventing fields',boundaries,async run=>{
    const summaries=await run("return [...document.querySelectorAll('.history-range')].map(e=>e.textContent)");
    assert.equal(summaries[0],'2026-10-20 23:50–2026-10-21 00:20');
    assert.equal(summaries[1],'开始时间未记录–结束时间未记录');
    assert.match(summaries[2],/^开始时间未记录–2026-10-21 /);
    const details=await run("document.querySelectorAll('.history-item')[1].open=true;return document.querySelectorAll('.history-item')[1].textContent");
    assert.match(details,/该记录没有保存时间/);assert.match(details,/原始计划时长未知/);assert.match(details,/累计追加时长未记录/);
    const legacy=await run("document.querySelectorAll('.history-item')[3].open=true;return document.querySelectorAll('.history-item')[3].textContent");
    assert.match(legacy,/原始计划时长未知/);assert.match(legacy,/累计追加时长15 分钟/);assert.match(legacy,/累计暂停时长1 分钟 5 秒/);
    assert.deepEqual(await run('return d.completed'),boundaries.completed);
    assert.equal(await run("return __rawGet('whatToDoData')"),JSON.stringify(boundaries));
  });

  const narrow=dataset(10);narrow.completed[0].taskName='没有空格的很长任务名称<>中文&'.repeat(30);
  await check('long text stays within narrow layouts in collapsed and expanded cards',narrow,async(run,_import,{protocol})=>{
    for(const width of [375,320,240]) {
      await protocol('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:true});
      for(const open of [false,true]) {
        await run(`document.querySelector('.history-item').open=${open};await new Promise(requestAnimationFrame)`);
        assert.ok(await run("return document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.history-item summary,.history-item dd,.history-arrow')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+.5})"));
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
