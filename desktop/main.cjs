const {app,BrowserWindow,Menu,protocol,net,ipcMain,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const ROOT=path.resolve(__dirname,'..');
const ASSETS=new Set(['index.html','app.js','i18n.js','style.css']);
protocol.registerSchemesAsPrivileged([{scheme:'nowwhat',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.setName('Now What');
const testing=process.env.NOWWHAT_E2E==='1';
if(testing&&process.env.NOWWHAT_E2E_PROFILE)app.setPath('userData',process.env.NOWWHAT_E2E_PROFILE);
let mainWindow;
function localPage(url){try{const u=new URL(url);return u.protocol==='nowwhat:'&&u.hostname==='app'&&u.pathname==='/index.html'}catch{return false}}
if(!app.requestSingleInstanceLock())app.quit();
else{
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus()}});
  app.whenReady().then(()=>{
    protocol.handle('nowwhat',request=>{
      const u=new URL(request.url),name=u.pathname.slice(1);
      if(u.hostname!=='app'||!ASSETS.has(name))return new Response('Not found',{status:404});
      return net.fetch(pathToFileURL(path.join(ROOT,name)).href).then(response=>{
        const headers=new Headers(response.headers);
        headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'");
        return new Response(response.body,{status:response.status,headers});
      });
    });
    Menu.setApplicationMenu(null);
    mainWindow=new BrowserWindow({width:1100,height:820,minWidth:360,minHeight:480,backgroundColor:'#f7f5f0',title:'Now What',icon:path.join(ROOT,'packaging/icon.png'),show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:false}});
    mainWindow.on('page-title-updated',event=>event.preventDefault());
    mainWindow.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    mainWindow.webContents.on('will-navigate',(event,url)=>{if(!localPage(url))event.preventDefault()});
    ipcMain.handle('backup:save',async(event,payload)=>{
      if(event.sender!==mainWindow.webContents||event.senderFrame!==event.sender.mainFrame||!localPage(event.senderFrame.url))throw Error('Untrusted document');
      if(!payload||typeof payload.content!=='string'||Buffer.byteLength(payload.content,'utf8')>32*1024*1024||!/^what-to-do-(?:backup\.json|original\.txt|timer-original\.txt)$/.test(payload.name))throw Error('Invalid backup');
      if(testing&&process.env.NOWWHAT_E2E_SAVE_DIR){
        await fs.writeFile(path.join(process.env.NOWWHAT_E2E_SAVE_DIR,payload.name),payload.content,'utf8');return true;
      }
      const result=await dialog.showSaveDialog(mainWindow,{defaultPath:path.join(app.getPath('documents'),payload.name),filters:[{name:payload.name.endsWith('.json')?'JSON':'Text',extensions:[payload.name.endsWith('.json')?'json':'txt']}]});
      if(result.canceled)return false;
      await fs.writeFile(result.filePath,payload.content,'utf8');return true;
    });
    mainWindow.once('ready-to-show',()=>{if(!testing)mainWindow.show()});
    mainWindow.loadURL('nowwhat://app/index.html');
  });
  app.on('window-all-closed',()=>app.quit());
}
