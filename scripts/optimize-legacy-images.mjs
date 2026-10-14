/**
 * SCT legacy website-media image audit / carefully gated in-place optimization.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run images:audit
 *        ... npm run images:optimize -- --apply
 * No credentials are committed. Audit is the default; --apply is explicit.
 * Backups are written before updating any original Storage object.
 */
import {createClient} from "@supabase/supabase-js";
import sharp from "sharp";
import {mkdir,writeFile,readFile,stat} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join,dirname} from "node:path";
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally (never NEXT_PUBLIC for the secret).");
const args=process.argv.slice(2);
const apply=args.includes("--apply");
const preview=args.includes("--preview");
if(apply&&preview)throw Error("Choose either --preview or --apply.");
const option=(name)=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const limit=option("--limit")===null?Infinity:Number(option("--limit"));
if(!(limit===Infinity||(Number.isSafeInteger(limit)&&limit>0)))throw Error("--limit must be a positive integer.");
const stagedDir=option("--staged-dir");
if(apply&&!stagedDir)throw Error("Apply requires --staged-dir from a completed preview.");
if(apply&&!args.includes("--confirm-backups"))throw Error("Apply also requires --confirm-backups.");
if(preview&&(!process.env.IMAGE_PREFIX||process.env.IMAGE_PREFIX==="" ))throw Error("Preview requires IMAGE_PREFIX to avoid full-bucket processing.");
if(apply&&(!process.env.IMAGE_PREFIX||process.env.IMAGE_PREFIX==="" ))throw Error("Apply requires IMAGE_PREFIX.");
const sha=(buffer)=>createHash("sha256").update(buffer).digest("hex");
const bucket="website-media";
const minimum=Number(process.env.IMAGE_MIN_BYTES||450000);
const root=process.env.IMAGE_PREFIX||"";
// Diagnostics must never print authorization headers, tokens or full request URLs.
const diagnosticFetch=async (input,init)=>{
 const target=typeof input==="string"?input:input instanceof URL?input.href:input.url;
 const path=new URL(target).pathname;
 try{
  const response=await fetch(input,{...init,signal:AbortSignal.timeout(20000)});
  if(!response.ok)console.error("Storage HTTP diagnostic:",response.status,response.statusText,"path:",path);
  return response;
 }catch(error){
  const cause=error?.cause;
  console.error("Storage network diagnostic:",{path,name:error?.name,message:error?.message,causeCode:cause?.code,causeMessage:cause?.message});
  throw error;
 }
};
const client=createClient(url,key,{auth:{persistSession:false},global:{fetch:diagnosticFetch}});
const run= new Date().toISOString().replace(/[:.]/g,"-");
const out=join("image-audit",run);
await mkdir(out,{recursive:true});
const candidates=[];
async function walk(prefix){
 for(let offset=0;;offset+=100){
  const {data,error}=await client.storage.from(bucket).list(prefix,{limit:100,offset,sortBy:{column:"name",order:"asc"}});
  if(error)throw Error("Storage list "+prefix+": "+error.message+" (status "+(error.status||"unknown")+")");
  for(const item of data||[]){
   const path=prefix?prefix+"/"+item.name:item.name;
   if(item.id==null){await walk(path);continue;}
   const size=Number(item.metadata?.size||0);
   const ext=item.name.split(".").pop()?.toLowerCase();
   if(!["jpg","jpeg","webp","png"].includes(ext)||size<minimum)continue;
   candidates.push({path,size,ext,status:"pending"});
  }
  if((data||[]).length<100)break;
 }
}
await walk(root);
candidates.sort((a,b)=>b.size-a.size);
console.log("Found",candidates.length,"candidate images, total",Math.round(candidates.reduce((s,x)=>s+x.size,0)/1048576),"MB");
// Preview downloads every candidate and writes ALL original backups before any update.
// Apply consumes that exact preview manifest; it never creates an implicit backup.
const manifestFile=stagedDir?join(stagedDir,"manifest.json"):join(out,"manifest.json");
let manifest=null;
if(apply){
 manifest=JSON.parse(await readFile(manifestFile,"utf8"));
 if(!manifest.complete||manifest.bucket!==bucket||manifest.root!==root)throw Error("Incomplete or mismatched preview manifest.");
 if(manifest.items.length!==candidates.length||manifest.items.some((x,i)=>x.path!==candidates[i].path||x.size!==candidates[i].size))throw Error("Storage candidates changed since preview. Re-run preview.");
 for(const item of manifest.items){
  const backup=await readFile(join(stagedDir,"backups",item.path));
  if(backup.length!==item.size||sha(backup)!==item.sha256)throw Error("Backup missing or checksum mismatch: "+item.path);
  if(item.status==="ready"){
   const optimized=await readFile(join(stagedDir,"optimized",item.path));
   if(sha(optimized)!==item.optimizedSha256)throw Error("Preview image missing or checksum mismatch: "+item.path);
  }
 }
 console.log("Verified all",manifest.items.length,"original backups and preview checksums.");
}
const stageItems=[];
let applied=0;
for(let i=0;i<candidates.length;i++){
 const row=candidates[i];
 if(!preview&&!apply){row.status="audit-only";continue;}
 try{
  if(apply){
   const staged=manifest.items[i];
   if(staged.status!=="ready"){row.status=staged.status;continue;}
   if(applied>=limit){row.status="deferred-limit";continue;}
   const {data,error}=await client.storage.from(bucket).download(row.path);
   if(error||!data)throw Error(error?.message||"Download failed");
   const current=Buffer.from(await data.arrayBuffer());
   if(sha(current)!==staged.sha256)throw Error("Remote original changed; refusing overwrite.");
   const optimized=await readFile(join(stagedDir,"optimized",row.path));
   const {error:uploadError}=await client.storage.from(bucket).update(row.path,optimized,{contentType:staged.contentType,upsert:true,cacheControl:"3600"});
   if(uploadError)throw Error(uploadError.message);
   row.status="updated";row.newSize=optimized.length;row.saved=current.length-optimized.length;applied++;
   continue;
  }
  const {data,error}=await client.storage.from(bucket).download(row.path);
  if(error||!data)throw Error(error?.message||"Download failed");
  const original=Buffer.from(await data.arrayBuffer());
  const backup=join(out,"backups",row.path);
  await mkdir(dirname(backup),{recursive:true});
  await writeFile(backup,original);
  const staged={path:row.path,size:original.length,sha256:sha(original),status:"pending"};
  stageItems.push(staged);
  const image=sharp(original,{failOn:"error"});
  const meta=await image.metadata();
  if(meta.pages&&meta.pages>1){row.status=staged.status="skipped-multipage";continue;}
  if(row.ext==="png"&&meta.hasAlpha){row.status=staged.status="skipped-transparent-png";continue;}
  const scale=meta.width&&meta.height&&Math.max(meta.width,meta.height)>1920?{width:1920,height:1920,fit:"inside",withoutEnlargement:true}:null;
  let transform=sharp(original).rotate();
  if(scale)transform=transform.resize(scale);
  const type=row.ext==="webp"?"image/webp":row.ext==="png"?"image/png":"image/jpeg";
  const optimized=await (type==="image/webp"?transform.webp({quality:82,effort:5}):type==="image/png"?transform.png({compressionLevel:9,effort:8}):transform.jpeg({quality:82,mozjpeg:true})).toBuffer();
  if(optimized.length>=original.length*.90){row.status=staged.status="skipped-low-savings";continue;}
  const optimizedPath=join(out,"optimized",row.path);
  await mkdir(dirname(optimizedPath),{recursive:true});
  await writeFile(optimizedPath,optimized);
  staged.status=row.status="ready";staged.optimizedSha256=sha(optimized);staged.optimizedSize=optimized.length;staged.contentType=type;
  row.newSize=optimized.length;row.saved=original.length-optimized.length;
 }catch(e){
  row.status="error";row.error=String(e);console.error("Failed:",row.path,row.error);
 }
 if((i+1)%20===0)console.log(i+1,"/",candidates.length);
}
if(preview){
 const complete=stageItems.length===candidates.length&&!candidates.some(x=>x.status==="error");
 await writeFile(join(out,"manifest.json"),JSON.stringify({complete,bucket,root,generatedAt:new Date().toISOString(),items:stageItems},null,2));
 console.log("Preview staged at:",out,"complete:",complete,"ready:",stageItems.filter(x=>x.status==="ready").length);
 if(!complete)console.error("Preview incomplete; APPLY WILL REFUSE.");
}
await writeFile(join(out,"report.json"),JSON.stringify({bucket,root,apply,preview,stagedDir,generatedAt:new Date().toISOString(),items:candidates},null,2));
const summary=candidates.reduce((m,x)=>(m[x.status]=(m[x.status]||0)+1,m),{});
console.log("Report:",join(out,"report.json"),summary);
console.log("IMPORTANT: keep image-audit backups secure; verify website and browser cache after applying.");
