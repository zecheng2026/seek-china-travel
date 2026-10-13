import type {Metadata} from "next";
import {preload} from "react-dom";
import HomePageClient from "./HomePageClient";

export const metadata:Metadata={
 title:"SEEK CHINA TRAVEL | Private & Tailor-Made China Tours",
 description:"Plan a private, tailor-made China journey with local experts. Explore destinations, flexible itineraries and practical travel advice with SEEK CHINA TRAVEL.",
 alternates:{canonical:"/"},
 openGraph:{
  title:"SEEK CHINA TRAVEL | Private & Tailor-Made China Tours",
  description:"Private and tailor-made China journeys designed around your pace, interests and travel style.",
  url:"/",
  type:"website",
  siteName:"SEEK CHINA TRAVEL"
 }
};

// Static export: resolve the public homepage hero during build, so the browser
// can discover the image immediately instead of waiting for a client-side query.
// The client still refreshes this configuration from Supabase after hydration.
async function getInitialHero(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 try{
  const response=await fetch(url.replace(/\/$/,"")+"/rest/v1/homepage_sections?section_key=eq.hero%3Ahome&select=content%2Cimage_url&limit=1",{
   headers:{apikey:key,Authorization:"Bearer "+key},cache:"no-store"
  });
  if(!response.ok)return null;
  const rows=await response.json() as Array<{content?:unknown;image_url?:string}>;
  const row=rows[0];
  if(!row)return null;
  let cfg:Record<string,unknown>={};
  try{cfg=typeof row.content==="string"?JSON.parse(row.content):((row.content as Record<string,unknown>)??{});}catch{}
  return {...cfg,image:String(cfg.image??row.image_url??"")};
 }catch{return null;}
}

export default async function Page(){
 const initialHero=await getInitialHero();
 const image=typeof initialHero?.image==="string"?initialHero.image:"";
 const mobile=typeof initialHero?.mobile_image==="string"?initialHero.mobile_image:"";
 if(image)preload(image,{as:"image",fetchPriority:"high",media:mobile?"(min-width: 651px)":undefined});
 if(mobile)preload(mobile,{as:"image",fetchPriority:"high",media:"(max-width: 650px)"});
 return <HomePageClient initialHero={initialHero}/>;
}
