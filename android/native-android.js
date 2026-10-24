// Only the packaged Android page includes this adapter; browser behavior is unchanged.
(()=>{
  const pending=new Map();let serial=0;
  window.nativeApp=Object.freeze({defaultLanguage:'en',productName:'Now What',exportText:(content,name)=>new Promise((resolve,reject)=>{
    const id=String(++serial);pending.set(id,{resolve,reject});
    try{NowWhatAndroid.exportText(id,content,name)}catch(error){pending.delete(id);reject(error)}
  })});
  addEventListener('native-backup-result',event=>{
    const reply=event.detail,request=pending.get(reply.id);if(!request)return;
    pending.delete(reply.id);reply.failed?request.reject(new Error('Backup export failed')):request.resolve(reply.saved);
  });
  new MutationObserver(()=>NowWhatAndroid.setTheme(document.documentElement.dataset.theme||'light')).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
