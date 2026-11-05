const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const browser=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'now-what-timer-concept-'));
const target=path.join(__dirname,'preview.png');
try{
 const result=spawnSync(browser,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--hide-scrollbars','--force-device-scale-factor=1','--window-size=1800,1080','--virtual-time-budget=800','--user-data-dir='+profile,'--screenshot='+target,pathToFileURL(path.join(__dirname,'index.html')).href],{encoding:'utf8',windowsHide:true,timeout:30000});
 if(result.error||result.status!==0)throw result.error||new Error(result.stderr||'Preview rendering failed');
 const png=fs.readFileSync(target);if(png.readUInt32BE(16)!==1800||png.readUInt32BE(20)!==1080)throw new Error('Unexpected image dimensions');
 console.log('Saved product preview: '+target);
}finally{
 const resolved=path.resolve(profile);
 if(path.dirname(resolved)!==path.resolve(os.tmpdir())||!path.basename(resolved).startsWith('now-what-timer-concept-'))throw new Error('Unsafe preview cleanup path');
 fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:200});
}
