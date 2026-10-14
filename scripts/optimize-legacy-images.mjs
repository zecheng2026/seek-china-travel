/**
 * SCT legacy website-media image audit / carefully gated in-place optimization.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run images:audit
 *        ... npm run images:optimize -- --apply
 * No credentials are committed. Audit is the default; --apply is explicit.
 * Backups are written before updating any original Storage object.
 */
import {createClient} from "@supabase/supabase-js";
import sharp from "sharp";
import {mkdir,writeFile} from "node:fs/promises";
import {join,dirname} from "node:path";
const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally (never NEXT_PUBLIC for the secret).");
const apply=process.argv.includes("--apply");
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
if(apply&&!process.argv.includes("--confirm-backups"))throw Error("To modify originals, also pass --confirm-backups. Audit report saved only after successful run.");
for(let i=0;i<candidates.length;i++){
 const row=candidates[i];
 if(!apply){row.status="audit-only";continue;}
 try{
  const {data,error}=await client.storage.from(bucket).download(row.path);
  if(error||!data)throw Error(error?.message||"Download failed");
  const original=Buffer.from(await data.arrayBuffer());
  const image=sharp(original,{failOn:"error"});
  const meta=await image.metadata();
  if(meta.pages&&meta.pages>1){row.status="skipped-multipage";continue;}
  if(row.ext==="png"&&meta.hasAlpha){row.status="skipped-transparent-png";continue;}
  const scale=meta.width&&meta.height&&Math.max(meta.width,meta.height)>1920?{width:1920,height:1920,fit:"inside",withoutEnlargement:true}:null;
  let transform=sharp(original).rotate();
  if(scale)transform=transform.resize(scale);
  const type=row.ext==="webp"?"image/webp":row.ext==="png"?"image/png":"image/jpeg";
  const optimized=await (type==="image/webp"?transform.webp({quality:82,effort:5}):type==="image/png"?transform.png({compressionLevel:9,effort:8}):transform.jpeg({quality:82,mozjpeg:true})).toBuffer();
  if(optimized.length>=original.length*.90){row.status="skipped-low-savings";continue;}
  const backup=join(out,"backups",row.path);
  await mkdir(dirname(backup),{recursive:true});
  await writeFile(backup,original);
  // Preserve path and format so existing website/Supabase references keep working.
  const {error:uploadError}=await client.storage.from(bucket).update(row.path,optimized,{contentType:type,upsert:true,cacheControl:"3600"});
  if(uploadError)throw Error(uploadError.message);
  row.status="updated";row.newSize=optimized.length;row.saved=original.length-optimized.length;
 }catch(e){row.status="error";row.error=String(e);console.error("Failed:",row.path,row.error);}
 if((i+1)%20===0)console.log(i+1,"/",candidates.length);
}
await writeFile(join(out,"report.json"),JSON.stringify({bucket,root,apply,generatedAt:new Date().toISOString(),items:candidates},null,2));
const summary=candidates.reduce((m,x)=>(m[x.status]=(m[x.status]||0)+1,m),{});
console.log("Report:",join(out,"report.json"),summary);
console.log("IMPORTANT: keep image-audit backups secure; validate public image URLs and browser caches before deleting backups.");
