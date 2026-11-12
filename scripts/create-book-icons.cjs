/* Original NowWhat mark. SVG and Android vectors share these editable paths. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const report=path.join(root,'docs/deployment/book-icons-2026-11-12');
const C={ink:'#452A1A',leather:'#703C25',brass:'#B18A50',paper:'#F0DFB7',gold:'#F1DCAD'};
const book=[
 ['Cover shadow','#452A1A','M76 172 Q76 160 90 159 Q182 151 256 179 Q330 151 422 159 Q436 160 436 172 L436 354 Q436 366 424 367 Q330 359 256 385 Q182 359 88 367 Q76 366 76 354 Z'],
 ['Leather binding','#B18A50','M76 160 Q76 148 90 147 Q182 139 256 167 Q330 139 422 147 Q436 148 436 160 L436 342 Q436 354 424 355 Q330 347 256 373 Q182 347 88 355 Q76 354 76 342 Z'],
 ['Page block','#D6BD87','M86 158 Q174 145 256 177 Q338 145 426 158 L426 342 Q337 331 256 361 Q175 331 86 342 Z'],
 ['Left page','#F0DFB7','M88 151 Q176 140 250 172 L250 347 Q175 318 88 331 Z'],
 ['Right page','#FFF0CF','M262 172 Q336 140 424 151 L424 331 Q337 318 262 347 Z'],
 ['Left page light','#F8EACC','M88 151 Q176 140 250 172 L250 187 Q175 157 88 168 Z'],
 ['Spine','#703C25','M250 172 L256 175 L262 172 L262 347 L256 352 L250 347 Z'],
 ['Bookmark','#703C25','M367 147 L391 146 L391 205 L379 196 L367 205 Z'],
 ['First line','#B18A50','M119 213 Q164 209 211 222 L211 232 Q164 219 119 223 Z'],
 ['Second line','#B18A50','M119 247 Q153 245 185 252 L185 262 Q153 255 119 257 Z'],
 ['Start','#703C25','M316 222 L316 285 Q316 289 320 287 L365 257 Q369 254 365 251 L320 220 Q316 218 316 222 Z']
];
const tile=[
 ['Leather tile','#703C25','M112 16 H400 Q496 16 496 112 V400 Q496 496 400 496 H112 Q16 496 16 400 V112 Q16 16 112 16 Z'],
 ['Tile lower shade','#542D1E','M16 336 Q256 406 496 336 V400 Q496 496 400 496 H112 Q16 496 16 400 Z'],
 ['Inset brass','#B18A50','M112 38 H400 Q474 38 474 112 V400 Q474 474 400 474 H112 Q38 474 38 400 V112 Q38 38 112 38 Z M112 42 Q42 42 42 112 V400 Q42 470 112 470 H400 Q470 470 470 400 V112 Q470 42 400 42 Z']
];
const mono=[
 ['Left leaf','#FFFFFF','M88 151 Q176 140 246 172 L246 347 Q175 318 88 331 Z'],
 ['Right leaf with start cutout','#FFFFFF','M266 172 Q336 140 424 151 L424 331 Q337 318 266 347 Z M316 222 L316 285 L365 254 Z']
];
const svgPaths=a=>a.map(([name,fill,d])=>`<path id="${name.replaceAll(' ','-')}" fill="${fill}" fill-rule="evenodd" d="${d}"/>`).join('\n');
function svg(mode='desktop'){
 if(mode==='notification')return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="translate(-1.824 -1.554) scale(.054)">${svgPaths(mono)}</g></svg>`;
 const inner=mode==='desktop'?svgPaths([...tile,...book]):`<g transform="translate(14.064 14.064) scale(.156)">${svgPaths(mode==='mono'?mono:book)}</g>`;
 const size=mode==='desktop'?512:108;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
}
function vector(a,size=108,transform=''){
 const paths=a.map(([,fill,d])=>`    <path android:fillColor="${fill}" android:fillType="evenOdd" android:pathData="${d}"/>`).join('\n');
 return `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="${size}dp" android:height="${size}dp" android:viewportWidth="${size}" android:viewportHeight="${size}">\n${transform?`  <group ${transform}>\n`:''}${paths}\n${transform?'  </group>\n':''}</vector>\n`;
}
function write(rel,body){const p=path.join(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);}
async function main(){
 fs.mkdirSync(report,{recursive:true});
 write('packaging/icon.svg',svg());write('packaging/icon-foreground.svg',svg('foreground'));write('packaging/icon-monochrome.svg',svg('mono'));write('packaging/icon-notification.svg',svg('notification'));
 write('packaging/icon-palette.json',JSON.stringify(C,null,2)+'\n');
 const transform='android:translateX="14.064" android:translateY="14.064" android:scaleX="0.156" android:scaleY="0.156"';
 write('android/res/drawable/app_icon.xml',vector([...tile,...book],108,'android:scaleX="0.2109375" android:scaleY="0.2109375"'));
 write('android/res/drawable/app_icon_background.xml',vector([['Leather',C.leather,'M0 0 H108 V108 H0 Z']]));
 write('android/res/drawable/app_icon_foreground.xml',vector(book,108,transform));
 write('android/res/drawable/app_icon_monochrome.xml',vector(mono,108,transform));
 write('android/res/drawable/ic_stat_nowwhat.xml',vector(mono,24,'android:translateX="-1.824" android:translateY="-1.554" android:scaleX="0.054" android:scaleY="0.054"'));
 for(const api of [26,33])write(`android/res/drawable-anydpi-v${api}/app_icon.xml`,`<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@drawable/app_icon_background"/>\n  <foreground android:drawable="@drawable/app_icon_foreground"/>\n${api===33?'  <monochrome android:drawable="@drawable/app_icon_monochrome"/>\n':''}</adaptive-icon>\n`);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:512,height:512},deviceScaleFactor:2});
 const sizes=[16,20,24,32,40,48,64,128,256,512,1024],pngs=[];
 for(const size of sizes){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg()}`);
  const png=await page.screenshot({omitBackground:true,scale:'css'});
  write(`packaging/icons/icon-${size}.png`,png);if(size<=256)pngs.push({size,png});if(size===512)write('packaging/icon.png',png);
 }
 const header=Buffer.alloc(6+16*pngs.length);header.writeUInt16LE(1,2);header.writeUInt16LE(pngs.length,4);let offset=header.length;
 pngs.forEach(({size,png},i)=>{const j=6+16*i;header[j]=size===256?0:size;header[j+1]=header[j];header.writeUInt16LE(1,j+4);header.writeUInt16LE(32,j+6);header.writeUInt32LE(png.length,j+8);header.writeUInt32LE(offset,j+12);offset+=png.length;});
 write('packaging/icon.ico',Buffer.concat([header,...pngs.map(x=>x.png)]));
 const uri=s=>'data:image/svg+xml;base64,'+Buffer.from(s).toString('base64');
 await page.setViewportSize({width:1040,height:650});
 const mask=(name,radius)=>`<div><div style="width:144px;height:144px;background:${C.leather};border-radius:${radius};overflow:hidden"><img width="216" height="216" style="margin:-36px" src="${uri(svg('foreground'))}"></div><p>${name}</p></div>`;
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#F0DFB7;color:#452A1A;font:16px Arial;padding:32px}h1{font:32px Georgia;margin:0 0 24px}.row{display:flex;align-items:end;gap:28px;margin-bottom:30px}.tile{text-align:center}p{margin:10px 0}.dark{background:#251911;padding:14px;border-radius:12px}</style><h1>NowWhat · Open the next page</h1><div class="row"><img width="240" height="240" src="${uri(svg())}">${[16,24,32,48,64,128].map(s=>`<div class="tile"><img width="${s}" height="${s}" src="${uri(svg())}"><p>${s} px</p></div>`).join('')}</div><div class="row">${mask('Android circle','50%')}${mask('Android rounded','24%')}${mask('Android squircle','38%')}<div class="dark"><img width="144" height="144" src="${uri(svg('mono'))}"><p style="color:#F0DFB7">Themed / monochrome</p></div><div class="dark"><svg width="24" height="24" viewBox="0 0 24 24"><g transform="translate(-1.824 -1.554) scale(.054)">${svgPaths(mono)}</g></svg><p style="color:#F0DFB7">24 px notification</p></div></div>`);
 await page.screenshot({path:path.join(report,'icon-preview.png'),scale:'css'});await browser.close();
 console.log('Generated SVG, 11 PNG sizes, nine-entry ICO, Android legacy/adaptive/monochrome vectors and preview.');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={book,tile,mono,svg,C};
