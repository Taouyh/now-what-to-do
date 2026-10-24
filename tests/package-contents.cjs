const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
async function run(){
 const apk=await require('unzipper').Open.file(path.join(root,'dist/android/Now-What-1.0.0-Android.apk'));
 const names=apk.files.map(f=>f.path);
 for(const file of ['AndroidManifest.xml','classes.dex','resources.arsc','assets/native-android.js'])assert.ok(names.includes(file),file);
 for(const file of ['app.js','i18n.js','style.css'])assert.deepEqual(await apk.files.find(f=>f.path==='assets/'+file).buffer(),await fs.readFile(path.join(root,file)),file+' matches current source');
 assert.deepEqual(await apk.files.find(f=>f.path==='assets/native-android.js').buffer(),await fs.readFile(path.join(root,'android/native-android.js')));
 const html=(await apk.files.find(f=>f.path==='assets/index.html').buffer()).toString('utf8');
 assert.equal(html,(await fs.readFile(path.join(root,'index.html'),'utf8')).replace('<script src="i18n.js','<script src="native-android.js"></script><script src="i18n.js'));
 assert.ok(!names.some(n=>/\.signing|keystore|\.jks$|signing\.json|node_modules|research/.test(n)));
 const badging=execFileSync(path.join(root,'.cache/android-sdk/build-tools/35.0.0/aapt2.exe'),['dump','badging',path.join(root,'dist/android/Now-What-1.0.0-Android.apk')],{encoding:'utf8',windowsHide:true}).replace(/\r/g,'');
 const labels=[...badging.matchAll(/^application-label(?:-[^:]+)?:'([^']*)'$/gm)].map(m=>m[1]);
 assert.ok(labels.length>0,'APK exposes its application label');
 assert.ok(labels.every(label=>label==='Now What'),'Android application name stays English in every packaged locale');
 console.log('PASS compiled APK application labels are Now What for every locale');
 console.log('PASS APK includes current UI, bridge and compiled activity, without signing secrets');
 const asar=require('@electron/asar'),archive=path.join(process.env.NOWWHAT_PACKAGED_DIR||path.join(root,'dist/windows/win-unpacked'),'resources/app.asar');
 const entries=asar.listPackage(archive);
 for(const file of ['index.html','app.js','i18n.js','style.css','desktop/main.cjs','desktop/preload.cjs'])assert.deepEqual(asar.extractFile(archive,file),await fs.readFile(path.join(root,file)),file+' matches Windows source');
 assert.ok(!entries.some(n=>/\.signing|research|test-artifacts|node_modules/.test(n)));
 console.log('PASS Windows application contains current source and excludes local data and build tools');
}
run().catch(e=>{console.error(e);process.exitCode=1});
