// Supabase Edge Function: content-deploy
// Deploy with JWT verification disabled; a separate high-entropy shared secret
// authenticates the cron request. Never expose this URL/secret in browser code.
import { createClient } from "npm:@supabase/supabase-js@2";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
Deno.serve(async req=>{
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const secret=Deno.env.get("CONTENT_DEPLOY_CRON_SECRET");
 const supplied=req.headers.get("x-content-deploy-secret");
 if(!secret||!supplied||supplied!==secret)return json({error:"Unauthorized"},401);
 const hook=Deno.env.get("CLOUDFLARE_DEPLOY_HOOK_URL");
 const url=Deno.env.get("SUPABASE_URL");
 const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!hook||!url||!serviceKey)return json({error:"Server secrets not configured"},503);
 const db=createClient(url,serviceKey,{auth:{persistSession:false}});
 const {data,error}=await db.rpc("content_deploy_snapshot");
 if(error)return json({error:"Unable to inspect pending content changes"},500);
 const state=data?.[0];
 if(!state||Number(state.revision)<=Number(state.deployed_revision))return json({status:"no_changes"});
 // The webhook only queues a Pages build; it does NOT guarantee the build
 // succeeds. The acknowledgment below means accepted for deployment.
 try{
   const response=await fetch(hook,{method:"POST",signal:AbortSignal.timeout(15000)});
   if(!response.ok)return json({error:"Cloudflare rejected deploy request",status:response.status},502);
   const {error:ackError}=await db.rpc("content_deploy_ack",{target_revision:state.revision});
   if(ackError)return json({error:"Deploy queued but acknowledgment failed"},500);
   return json({status:"queued",revision:state.revision});
 }catch{return json({error:"Cloudflare deploy request failed"},502)}
});
