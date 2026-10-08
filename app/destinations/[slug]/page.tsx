import type {Metadata} from "next";
import DestinationDetail from "./DestinationDetailClient";
import {createBuildClient,siteUrl} from "../../../utils/supabase/build";

const clean=(v:unknown)=>String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const first=(...values:unknown[])=>values.map(clean).find(Boolean)??"";
const destinationUrl=(slug:string)=>siteUrl+"/destinations/"+encodeURIComponent(slug);

export async function generateStaticParams(){
 const s=createBuildClient();
 const {data,error}=await s.from("destinations").select("slug").eq("is_active",true);
 if(error)throw new Error("Cannot generate active destination pages: "+error.message);
 return (data??[]).filter(x=>x.slug).map(x=>({slug:String(x.slug)}));
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const s=createBuildClient();
 const {data}=await s.from("destinations").select("*").eq("slug",slug).eq("is_active",true).maybeSingle();
 if(!data)return {title:"China Destination | SEEK CHINA TRAVEL",robots:{index:false,follow:false}};
 const name=first(data.name,"China");
 const title=first(data.seo_title,name+" Travel Guide & Private Tours");
 const fullTitle=title.includes("SEEK CHINA TRAVEL")?title:title+" | SEEK CHINA TRAVEL";
 const description=first(data.seo_description,data.short_description,data.description,"Explore "+name+" with private, tailor-made journeys by SEEK CHINA TRAVEL.").slice(0,160);
 const image=first(data.hero_image_url,data.image_url,data.cover_image_url);
 const url=destinationUrl(slug);
 return {title:fullTitle,description,alternates:{canonical:url},openGraph:{title:fullTitle,description,url,type:"website",images:image?[{url:image}]:[]},twitter:{card:"summary_large_image",title:fullTitle,description,...(image?{images:[image]}:{})}};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 return <DestinationDetail slug={slug}/>;
}
