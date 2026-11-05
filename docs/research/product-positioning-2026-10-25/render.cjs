// Run with node. Uses local Chrome headless; no remote assets or product data.
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const browser=process.env.RESEARCH_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=path.resolve(__dirname,'../../../.cache/research-chrome-profile');
const names=['01-positioning','02-competitors','03-experience','04-business-open-source'];
for(const [i,name] of names.entries()){
  const url=pathToFileURL(path.join(__dirname,'index.html'));
  url.search='capture=1&page='+(i+1);
  const target=path.join(__dirname,name+'.png');
  const result=spawnSync(browser,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check',
    '--hide-scrollbars','--force-device-scale-factor=1','--window-size=1440,1050',
    '--user-data-dir='+profile,'--screenshot='+target,url.href],
    {encoding:'utf8',windowsHide:true,timeout:25000});
  if(result.error || result.status!==0)throw result.error || new Error(result.stderr);
  const png=fs.readFileSync(target);
  if(png.readUInt32BE(16)!==1440 || png.readUInt32BE(20)!==1050)throw new Error('Unexpected image size: '+name);
  console.log(name+': 1440 x 1050');
}
