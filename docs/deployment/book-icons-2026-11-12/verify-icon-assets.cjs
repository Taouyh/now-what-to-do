const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'../../..');
const {svg}=require(path.join(root,'scripts/create-book-icons.cjs'));
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();await page.setContent(svg('foreground'));
 const radius=await page.evaluate(()=>{
  let max=0;
  for(const p of document.querySelectorAll('path'))for(let i=0;i<=1000;i++){
   const q=p.getPointAtLength(p.getTotalLength()*i/1000);
   max=Math.max(max,Math.hypot(14.064+.156*q.x-54,14.064+.156*q.y-54));
  }
  return max;
 });await browser.close();if(radius>33)throw Error('Adaptive safe circle exceeded');
 const ico=fs.readFileSync(path.join(root,'packaging/icon.ico'));
 const sizes=[];
 for(let i=0;i<ico.readUInt16LE(4);i++){
  const at=6+16*i,size=ico[at]||256,length=ico.readUInt32LE(at+8),offset=ico.readUInt32LE(at+12);
  const embedded=ico.subarray(offset,offset+length);
  if(!embedded.equals(fs.readFileSync(path.join(root,`packaging/icons/icon-${size}.png`))))throw Error('ICO entry differs from PNG');
  if(embedded.readUInt32BE(16)!==size||embedded.readUInt32BE(20)!==size)throw Error('PNG size mismatch');
  sizes.push(size);
 }
 if(sizes.join(',')!=='16,20,24,32,40,48,64,128,256')throw Error('Missing ICO sizes');
 const files=['packaging/icon.png','packaging/icon.ico','packaging/icon.svg','android/res/drawable/app_icon.xml','android/res/drawable-anydpi-v26/app_icon.xml','android/res/drawable-anydpi-v33/app_icon.xml'];
 const result={date:'2026-11-12',adaptiveCanvas:108,safeCircleRadius:33,sampledMaxArtworkRadius:radius,icoSizes:sizes,files:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')})),limitations:'SVG mask previews and resource compile/link only; no physical launcher or notification display acceptance.'};
 fs.writeFileSync(path.join(__dirname,'asset-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
