// Real installer/uninstaller in a unique test directory; registry and shortcuts are disabled.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
async function run(){
 const dir=await fs.mkdtemp(path.join(root,'test-artifacts/installer-'));
 const install=path.join(dir,'Folder with spaces');
 const env={...process.env,NOWWHAT_INSTALL_TEST:'1'};
 const result=spawnSync(path.join(root,`dist/windows/Now-What-${version}-Windows-x64-Setup.exe`),['/S','/D='+install],{env,windowsHide:true,windowsVerbatimArguments:true,timeout:60000});
 assert.ifError(result.error);assert.equal(result.status,0,'silent install succeeds');
 const payload=path.join(root,'dist/windows/webview2-unpacked');
 const manifest=JSON.parse(await fs.readFile(path.join(root,'dist/web/manifest.json'),'utf8'));
 for(const file of ['Now What.exe','native-webview2.js','LICENSE-WebView2.txt','NOTICE-WebView2.txt','web/manifest.json',...manifest.map(item=>'web/'+item.path)])assert.deepEqual(await fs.readFile(path.join(install,file)),await fs.readFile(path.join(payload,file)),file+' installer matches payload');
 assert.deepEqual(await fs.readFile(path.join(install,'LICENSE')),await fs.readFile(path.join(root,'LICENSE')));
 await fs.writeFile(path.join(install,'unrelated-file.txt'),'keep me');
 await fs.writeFile(path.join(install,'web/assets/unrelated-note.txt'),'keep this too');
 const smoke=spawnSync(process.execPath,[path.join(root,'tests/native-book-smoke.cjs')],{cwd:root,env:{...env,NOWWHAT_NATIVE_DIR:install},windowsHide:true,timeout:60000,encoding:'utf8'});
 assert.ifError(smoke.error);assert.equal(smoke.status,0,smoke.stderr||smoke.stdout);console.log(smoke.stdout.trim());
 const uninstalled=spawnSync(path.join(install,'Uninstall.exe'),['/S','_?='+install],{env,windowsHide:true,windowsVerbatimArguments:true,timeout:60000});
 assert.ifError(uninstalled.error);assert.equal(uninstalled.status,0);
 assert.equal(await fs.readFile(path.join(install,'unrelated-file.txt'),'utf8'),'keep me');
 assert.equal(await fs.readFile(path.join(install,'web/assets/unrelated-note.txt'),'utf8'),'keep this too');
 assert.equal(await fs.stat(path.join(install,'web/assets/environment.webp')).then(()=>true,()=>false),false);
 assert.equal(await fs.stat(path.join(install,'web/app.js')).then(()=>true,()=>false),false);
 console.log('PASS real installer installs current files to a path with spaces; uninstaller preserves unrelated files and never touches app profiles');
}
run().catch(e=>{console.error(e);process.exitCode=1});
