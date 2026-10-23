const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nativeApp',Object.freeze({
  defaultLanguage:'en',
  exportText:(content,name)=>ipcRenderer.invoke('backup:save',{content,name})
}));
