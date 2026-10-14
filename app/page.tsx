import type {Metadata} from "next";
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

// Start the public Hero configuration request before React hydration. The image URL
// is managed in Supabase and is intentionally not hard-coded into the build.
const heroBootstrap = `(function(){
  try {
    var url=window.__SCT_SUPABASE_URL__,key=window.__SCT_SUPABASE_KEY__;
    if(!url||!key)return;
    fetch(url+"/rest/v1/homepage_sections?section_key=eq.hero%3Ahome&select=content%2Cimage_url&limit=1",{
      headers:{"apikey":key}
    }).then(function(r){if(!r.ok)throw Error("Hero config unavailable");return r.json()})
    .then(function(rows){
      var row=rows&&rows[0];if(!row)return;
      var cfg=typeof row.content==="string"?JSON.parse(row.content):row.content||{};
      var src=cfg.image||row.image_url;if(typeof src!=="string"||!/^https?:\\/\\//.test(src))return;
      var preload=document.createElement("link");preload.rel="preload";preload.as="image";preload.href=src;
      preload.fetchPriority="high";document.head.appendChild(preload);
    }).catch(function(){});
  }catch(e){}
})();`;
export default function Page(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";
 return <><script dangerouslySetInnerHTML={{__html:`window.__SCT_SUPABASE_URL__=${JSON.stringify(url)};window.__SCT_SUPABASE_KEY__=${JSON.stringify(key)};`+heroBootstrap}}/><HomePageClient/></>;
}
