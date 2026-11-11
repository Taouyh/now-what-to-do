(()=>{
  if(location.origin!=='https://nowwhat.local'||location.pathname!=='/index.html'||window.top!==window)return;
  const pending=new Map();let serial=0;
  window.nativeApp=Object.freeze({defaultLanguage:'en',productName:'Now What',syncReminder:payload=>chrome.webview.postMessage({kind:'reminder:sync',payload}),requestReminders:()=>chrome.webview.postMessage({kind:'reminder:settings'}),exportText:(content,name)=>new Promise((resolve,reject)=>{
    const id=String(++serial);pending.set(id,{resolve,reject});
    try{chrome.webview.postMessage({kind:'backup:save',id,content,name})}catch(error){pending.delete(id);reject(error)}
  })});
  chrome.webview.addEventListener('message',event=>{
    const reply=event.data,request=reply&&pending.get(reply.id);if(!request)return;
    pending.delete(reply.id);reply.failed?request.reject(new Error('Backup export failed')):request.resolve(reply.saved);
  });
})();
