export const dynamic = "force-static";
import type {MetadataRoute} from "next";
import {createBuildClient,siteUrl} from "../utils/supabase/build";

// Refresh published URLs on each deployment. Cloudflare Pages uses a static export.
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const s=createBuildClient();
 const base=["","/tours","/destinations","/travel-guide","/about","/contact","/quote"].map(path=>({url:siteUrl+path,changeFrequency:"weekly" as const,priority:path===""?1:.8}));
 const [d,t,g]=await Promise.all([
  s.from("destinations").select("slug,updated_at").eq("is_active",true),
  s.from("tours").select("slug,updated_at").eq("is_published",true),
  s.from("travel_guides").select("slug,updated_at").eq("is_published",true)
 ]);
 for(const [label,result] of [["destinations",d],["tours",t],["travel_guides",g]] as const){
  if(result.error) throw new Error("Unable to generate sitemap for "+label+": "+result.error.message);
 }
 const rows=(items:{slug:string|null;updated_at:string|null}[]|null,prefix:string,priority:number)=>
  (items??[]).filter(x=>x.slug).map(x=>({
   url:siteUrl+prefix+encodeURIComponent(x.slug!),
   ...(x.updated_at&&!Number.isNaN(Date.parse(x.updated_at))?{lastModified:new Date(x.updated_at)}:{}),
   changeFrequency:"weekly" as const,priority
  }));
 return [...base,...rows(d.data,"/destinations/",.8),...rows(t.data,"/tours/",.9),...rows(g.data,"/travel-guide/",.7)];
}
