import type {Metadata} from "next";
import TourDetailClient from "./TourDetailClient";
import {createBuildClient,siteUrl} from "../../../utils/supabase/build";

const clean=(value:unknown)=>String(value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const first=(...values:unknown[])=>values.map(clean).find(Boolean)??"";
const tourUrl=(slug:string)=>siteUrl+"/tours/"+encodeURIComponent(slug);

export async function generateStaticParams(){
 const s=createBuildClient();
 const {data,error}=await s.from("tours").select("slug").eq("is_published",true);
 if(error)throw new Error("Cannot generate published tour pages: "+error.message);
 return (data??[]).filter(x=>x.slug).map(x=>({slug:String(x.slug)}));
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const s=createBuildClient();
 const {data}=await s.from("tours").select("*").eq("slug",slug).eq("is_published",true).maybeSingle();
 if(!data)return {title:"China Tour | SEEK CHINA TRAVEL",robots:{index:false,follow:false}};
 const name=first(data.name,data.title,"Private China Tour");
 const title=first(data.seo_title,name+" | Private China Tour");
 const description=first(data.seo_description,data.subtitle,data.short_description,data.overview,"Explore "+name+" with a private, tailor-made China itinerary from SEEK CHINA TRAVEL.").slice(0,160);
 const image=first(data.hero_image_url,data.cover_image_url);
 const url=tourUrl(slug);
 const fullTitle=title.includes("SEEK CHINA TRAVEL")?title:title+" | SEEK CHINA TRAVEL";
 return {title:fullTitle,description,alternates:{canonical:url},openGraph:{title:fullTitle,description,url,type:"website",images:image?[{url:image}]:[]},twitter:{card:"summary_large_image",title:fullTitle,description,...(image?{images:[image]}:{})}};
}

export default async function TourDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const s=createBuildClient();
 const {data}=await s.from("tours").select("*").eq("slug",slug).eq("is_published",true).maybeSingle();
 if(!data)return <TourDetailClient slug={slug}/>;
 const {data:days,error:daysError}=await s.from("tour_days").select("*").eq("tour_id",data.id).order("day_number",{ascending:true});
 if(daysError)throw new Error("Cannot generate tour itinerary: "+daysError.message);
 const title=first(data.name,data.title,"Private China Tour");
 const description=first(data.seo_description,data.subtitle,data.short_description,data.overview,"Private China journey by SEEK CHINA TRAVEL.");
 const image=first(data.hero_image_url,data.cover_image_url);
 const jsonLd={
  "@context":"https://schema.org","@type":"TouristTrip",
  "name":title,"description":description,"url":tourUrl(slug),
  ...(image?{"image":image}:{}),
  "provider":{"@type":"TravelAgency","name":"SEEK CHINA TRAVEL","url":siteUrl}
 };
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><TourDetailClient slug={slug} initialTour={data} initialDays={days??[]}/></>;
}
