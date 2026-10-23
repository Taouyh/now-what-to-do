// Range downloads tolerate slow connections; the complete file must match its published digest.
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const [url,sizeText,algorithm,digest,target]=process.argv.slice(2),size=Number(sizeText),chunkSize=2*1024*1024;
if(!url?.startsWith('https://')||!Number.isSafeInteger(size)||size<=0||!digest||!target)throw Error('Expected HTTPS URL, byte size, hash algorithm, digest and output path');
async function run(){
 await fs.mkdir(path.dirname(target),{recursive:true});
 const parts=target+'.parts';await fs.mkdir(parts,{recursive:true});
 let next=0,done=0;const total=Math.ceil(size/chunkSize);
 async function worker(){while(next<total){const i=next++,start=i*chunkSize,end=Math.min(size-1,start+chunkSize-1),file=path.join(parts,String(i));
  if((await fs.stat(file).catch(()=>null))?.size!==end-start+1)await new Promise((resolve,reject)=>{
   const proc=spawn('curl.exe',['--fail','--location','--silent','--show-error','--retry','2','--retry-delay','1','--connect-timeout','15','--max-time','240','--range',start+'-'+end,url,'--output',file],{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';proc.stderr.on('data',b=>stderr+=b);proc.on('error',reject);proc.on('exit',code=>code===0?resolve():reject(Error(stderr||'curl failed: '+code)));
  });
  if((await fs.stat(file)).size!==end-start+1)throw Error('Unexpected range response for chunk '+i);
  done++;if(done%5===0||done===total)console.log(done+'/'+total+' verified-length chunks');
 }}
 await Promise.all(Array.from({length:6},worker));
 const output=await fs.open(target,'w'),hash=crypto.createHash(algorithm);
 try{for(let i=0;i<total;i++){const data=await fs.readFile(path.join(parts,String(i)));hash.update(data);await output.write(data)}}finally{await output.close()}
 if(hash.digest('hex').toLowerCase()!==digest.toLowerCase())throw Error('Published digest does not match');
 console.log('Verified '+target);
}
run().catch(error=>{console.error(error.message);process.exitCode=1});
