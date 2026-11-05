const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
(async()=>{
 // Release links stay at published 1.3 while 1.4 is under development.
 // Publishing must run the additional release-link gate.
 if(process.argv.includes('--release'))for(const source of ['README.md','README.zh-CN.md','README.ja.md','about/index.html']){
   const links=[...(await fs.readFile(path.join(root,source),'utf8')).matchAll(/releases\/download\/([^/]+)\/([^"\s)<>]+)/g)];
   assert.equal(links.length,2);assert.deepEqual(links.map(m=>m[2]).sort(),[`Now-What-${version}-Windows-x64-Setup.exe`,`Now-What-${version}-Android.apk`].sort());assert.ok(links.every(m=>m[1]==='v'+version));
 }
 const web=path.join(root,'dist/web'),manifest=JSON.parse(await fs.readFile(path.join(web,'manifest.json'),'utf8'));
 const apkPath=path.join(root,`dist/android/Now-What-${version}-Android.apk`),apk=await require('unzipper').Open.file(apkPath);
 const payload=process.env.NOWWHAT_NATIVE_DIR||path.join(root,'dist/windows/webview2-unpacked');
 for(const file of manifest.map(item=>item.path)){
   let expected=await fs.readFile(path.join(web,file));
   assert.deepEqual(await fs.readFile(path.join(payload,'web',file)),expected,`Windows ${file}`);
   if(file==='index.html')expected=Buffer.from(expected.toString('utf8').replace('<!-- native-bridge -->','<script src="native-android.js"></script>'));
   const entry=apk.files.find(item=>item.path==='assets/'+file);assert.ok(entry,`Android ${file}`);assert.deepEqual(await entry.buffer(),expected,`Android ${file}`);
 }
 assert.deepEqual(await fs.readFile(path.join(payload,'native-webview2.js')),await fs.readFile(path.join(root,'desktop/webview2/native-webview2.js')));
 assert.deepEqual(await apk.files.find(item=>item.path==='assets/native-android.js').buffer(),await fs.readFile(path.join(root,'android/native-android.js')));
 for(const file of ['AndroidManifest.xml','classes.dex','resources.arsc'])assert.ok(apk.files.some(item=>item.path===file));
 assert.ok(!apk.files.some(item=>/\.signing|keystore|\.jks$|signing\.json|node_modules|research/.test(item.path)));
 const badging=execFileSync(path.join(root,'.cache/android-sdk/build-tools/35.0.0/aapt2.exe'),['dump','badging',apkPath],{encoding:'utf8',windowsHide:true});
 assert.ok(badging.includes(`versionName='${version}'`));assert.ok(badging.includes("package: name='io.github.taouyh.nowwhat'"));
 assert.ok((await fs.stat(path.join(payload,'Now What.exe'))).size<2000000);
 console.log(`PASS: ${manifest.length} production files match Windows and Android; bridges, version, package identity and secret exclusions verified.`);
})().catch(error=>{console.error(error);process.exitCode=1});
