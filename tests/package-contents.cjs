const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const version=require('../package.json').version;
async function run(){
 const downloads=[`Now-What-${version}-Windows-x64-Setup.exe`,`Now-What-${version}-Android.apk`];
 for(const source of ['README.md','README.zh-CN.md','README.ja.md','about/index.html']){
  const links=[...(await fs.readFile(path.join(root,source),'utf8')).matchAll(/releases\/download\/([^/]+)\/([^"\s)<>]+)/g)];
  assert.equal(links.length,2,source+' exposes both downloads');
  assert.deepEqual(links.map(m=>m[2]).sort(),[...downloads].sort(),source+' filenames match built assets');
  assert.ok(links.every(m=>m[1]==='v'+version),source+' tag matches package version');
 }
 console.log('PASS all three READMEs and promotional download links match release version and filenames');
 const apk=await require('unzipper').Open.file(path.join(root,`dist/android/Now-What-${version}-Android.apk`));
 const names=apk.files.map(f=>f.path);
 for(const file of ['AndroidManifest.xml','classes.dex','resources.arsc','assets/native-android.js'])assert.ok(names.includes(file),file);
 for(const file of ['app.js','i18n.js','style.css'])assert.deepEqual(await apk.files.find(f=>f.path==='assets/'+file).buffer(),await fs.readFile(path.join(root,file)),file+' matches current source');
 assert.deepEqual(await apk.files.find(f=>f.path==='assets/native-android.js').buffer(),await fs.readFile(path.join(root,'android/native-android.js')));
 const html=(await apk.files.find(f=>f.path==='assets/index.html').buffer()).toString('utf8');
 assert.equal(html,(await fs.readFile(path.join(root,'index.html'),'utf8')).replace('<script src="i18n.js','<script src="native-android.js"></script><script src="i18n.js'));
 assert.ok(!names.some(n=>/\.signing|keystore|\.jks$|signing\.json|node_modules|research/.test(n)));
 const badging=execFileSync(path.join(root,'.cache/android-sdk/build-tools/35.0.0/aapt2.exe'),['dump','badging',path.join(root,`dist/android/Now-What-${version}-Android.apk`)],{encoding:'utf8',windowsHide:true}).replace(/\r/g,'');
 assert.ok(badging.includes(`versionName='${version}'`));
 const labels=[...badging.matchAll(/^application-label(?:-[^:]+)?:'([^']*)'$/gm)].map(m=>m[1]);
 assert.ok(labels.length>0,'APK exposes its application label');
 assert.ok(labels.every(label=>label==='Now What'),'Android application name stays English in every packaged locale');
 console.log('PASS compiled APK application labels are Now What for every locale');
 console.log('PASS APK includes current UI, bridge and compiled activity, without signing secrets');
 const payload=process.env.NOWWHAT_NATIVE_DIR||path.join(root,'dist/windows/webview2-unpacked');
 for(const file of ['index.html','app.js','i18n.js','style.css'])assert.deepEqual(await fs.readFile(path.join(payload,'web',file)),await fs.readFile(path.join(root,file)),file+' matches Windows source');
 assert.deepEqual(await fs.readFile(path.join(payload,'native-webview2.js')),await fs.readFile(path.join(root,'desktop/webview2/native-webview2.js')));
 const entries=await fs.readdir(payload);
 assert.deepEqual(entries.sort(),['LICENSE-WebView2.txt','NOTICE-WebView2.txt','Now What.exe','native-webview2.js','web'].sort());
 assert.ok((await fs.stat(path.join(payload,'Now What.exe'))).size<2000000,'small native executable');
 console.log('PASS Windows application contains current source and excludes local data and build tools');
}
run().catch(e=>{console.error(e);process.exitCode=1});
