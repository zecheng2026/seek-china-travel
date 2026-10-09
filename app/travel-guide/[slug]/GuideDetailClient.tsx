"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "../../../utils/supabase/client";

type Row=Record<string,unknown>;
const value=(v:unknown)=>String(v??"").trim();
const normalize=(v:unknown)=>value(v).toLowerCase();
function Html({value:html}:{value:unknown}){return html?<div className="tourHtml" dangerouslySetInnerHTML={{__html:String(html)}}/>:null;}
function matches(text:string,name:string){const n=normalize(name);if(n.length<4)return false;const pos=text.indexOf(n);if(pos<0)return false;const before=text[pos-1]??" ";const after=text[pos+n.length]??" ";return !/[a-z]/.test(before)&&!/[a-z]/.test(after);}
function prioritize<T extends Row>(items:T[],score:(item:T)=>number,limit:number){return items.map((item,index)=>({item,index,score:score(item)})).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,limit).map(x=>x.item);}

export default function GuideDetail({slug:slugProp,initialGuide}:{slug?:string;initialGuide?:Row|null}){
 const supabase=useMemo(()=>createClient(),[]);
 const [runtimeSlug,setRuntimeSlug]=useState("");
 const slug=slugProp??runtimeSlug;
 const [guide,setGuide]=useState<Row|null>(initialGuide??null);
 const [destinations,setDestinations]=useState<Row[]>([]);
 const [tours,setTours]=useState<Row[]>([]);
 const [loading,setLoading]=useState(!initialGuide);
 useEffect(()=>{if(slugProp)return;const segments=window.location.pathname.split("/").filter(Boolean);const guideIndex=segments.indexOf("travel-guide");const pathSlug=guideIndex>=0?segments[guideIndex+1]??"":"";let decoded=pathSlug;try{decoded=decodeURIComponent(pathSlug);}catch{}setRuntimeSlug(decoded||new URLSearchParams(window.location.search).get("slug")||"");},[slugProp]);
 useEffect(()=>{if(initialGuide){setGuide(initialGuide);setLoading(false);return;}if(!slug){setLoading(false);return;}let cancelled=false;setLoading(true);setDestinations([]);setTours([]);const timeout=new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error("Guide request timed out")),10000));void Promise.race([supabase.from("travel_guides").select("*").eq("slug",slug).eq("is_published",true).maybeSingle(),timeout]).then(({data})=>{if(!cancelled)setGuide((data as Row|null)??null);}).catch(()=>{if(!cancelled)setGuide(null);}).finally(()=>{if(!cancelled)setLoading(false);});return ()=>{cancelled=true;};},[slug,supabase,initialGuide]);
 useEffect(()=>{
  if(!guide)return;
  let cancelled=false;
  const articleText=[guide.title,guide.name,guide.summary,guide.short_description,guide.content,guide.description].map(v=>value(v).replace(/<[^>]*>/g," ")).join(" ").toLowerCase();
  void Promise.all([
   supabase.from("destinations").select("id,name,slug").eq("is_active",true),
   supabase.from("tours").select("id,name,title,slug,destination,destination_id").eq("is_published",true)
  ]).then(([destinationResult,tourResult])=>{
   if(cancelled)return;
   const allDestinations=((destinationResult.data as Row[]|null)??[]).filter(d=>value(d.slug)&&value(d.name));
   const rankedDestinations=prioritize(allDestinations,d=>matches(articleText,value(d.name))?2:0,4);
   setDestinations(rankedDestinations);
   const relevantIds=new Set(rankedDestinations.filter(d=>matches(articleText,value(d.name))).map(d=>value(d.id)));
   const relevantNames=new Set(rankedDestinations.filter(d=>matches(articleText,value(d.name))).map(d=>normalize(d.name)));
   const allTours=((tourResult.data as Row[]|null)??[]).filter(t=>value(t.slug)&&value(t.name??t.title));
   setTours(prioritize(allTours,t=>{
    const dest=normalize(t.destination);
    return (matches(articleText,value(t.name??t.title))?4:0)+(relevantIds.has(value(t.destination_id))||relevantNames.has(dest)?3:0)+(matches(articleText,dest)?2:0);
   },3));
  });
  return ()=>{cancelled=true;};
 },[guide,supabase]);
 if(loading)return <main className="tourLoading"><p>Loading travel guide…</p></main>;
 if(!guide)return <main className="tourLoading"><div><h1>Guide not found</h1><Link href="/travel-guide" className="btn">All Travel Guides →</Link></div></main>;
 const title=value(guide.title??guide.name)||"China Travel Guide";
 const image=value(guide.hero_image_url??guide.image_url??guide.cover_image_url);
 const category=value(guide.category??guide.type)||"CHINA TRAVEL GUIDE";
 const imagePosition=`${Number(guide.image_position_x??50)}% ${Number(guide.image_position_y??50)}%`;
 const isNews=category==="China Travel Updates";
 const updatedAt=value(guide.updated_at??guide.created_at);
 const formattedDate=updatedAt&&!Number.isNaN(Date.parse(updatedAt))?new Date(updatedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"";
 return <main className="guideDetail">
  <section className={isNews?"newsDetailHeader":"guideDetailHero"} style={!isNews&&image?{backgroundImage:"url('"+image+"')",backgroundPosition:imagePosition}:undefined}>{!isNews&&<div className="journeyHeroShade"/>}<div className="journeyHeroContent"><Link href={isNews?"/china-travel-updates":"/travel-guide"} className="journeyBack">← {isNews?"All Travel Updates":"Travel Guide"}</Link><p className="journeysKicker">{category.toUpperCase()}</p><h1>{title}</h1>{isNews&&formattedDate&&<p className="newsPublishedDate">Updated {formattedDate} · SEEK CHINA TRAVEL</p>}{!isNews&&Boolean(guide.summary??guide.short_description)&&<p>{value(guide.summary??guide.short_description)}</p>}</div></section>
  {isNews&&<style>{`.newsDetailHeader{background:#EDF3F7!important;background-image:none!important;min-height:0!important;height:auto!important;padding:36px max(24px,calc((100vw - 1120px)/2)) 32px!important;color:#103b59!important;border-bottom:1px solid #dfe7ed}.newsDetailHeader .journeyHeroContent{position:static!important;transform:none!important;max-width:960px!important;padding:0!important;margin:0!important;color:#103b59!important}.newsDetailHeader .journeyHeroContent h1{color:#103b59!important;font-size:clamp(29px,4vw,45px)!important;line-height:1.24!important;margin:15px 0!important;text-shadow:none!important}.newsDetailHeader .journeyBack{color:#57758a!important;font-size:13px!important;text-decoration:none}.newsDetailHeader .journeysKicker{color:#d83b42!important;margin-top:34px!important}.newsDetailHeader .newsPublishedDate{color:#65798a!important;font-size:13px!important;margin:16px 0 0!important;text-shadow:none!important}@media(max-width:600px){.newsDetailHeader{padding:26px 16px!important}.newsDetailHeader .journeyHeroContent h1{font-size:28px!important}}`}</style>}
  <section className="guideArticleLayout"><article className="guideArticle">
   <Html value={guide.content??guide.description}/>
   <nav aria-label="Continue exploring China" className="guideRelated">
    <section className="guideRelatedSection">
     <p className="journeysKicker">KEEP EXPLORING</p><h2>Explore Related Destinations</h2>
     {destinations.length>0?<div className="guideRelatedGrid">{destinations.map(d=><Link className="guideRelatedCard" key={value(d.id??d.slug)} href={"/destinations/"+encodeURIComponent(value(d.slug))}><strong>{value(d.name)}</strong><span>Explore destination →</span></Link>)}</div>:<p><Link href="/destinations">Explore all China destinations →</Link></p>}
    </section>
    <section className="guideRelatedSection">
     <p className="journeysKicker">PLAN YOUR JOURNEY</p><h2>Recommended China Tours</h2>
     {tours.length>0?<div className="guideRelatedGrid">{tours.map(t=><Link className="guideRelatedCard" key={value(t.id??t.slug)} href={"/tours/"+encodeURIComponent(value(t.slug))}><strong>{value(t.name??t.title)}</strong><span>View tour itinerary →</span></Link>)}</div>:<p><Link href="/tours">Explore all private China tours →</Link></p>}
    </section>
   </nav>
  </article><aside className="journeySidebar"><div className="journeyPlanCard"><p className="journeysKicker">PLAN WITH LOCAL EXPERTS</p><h3>Turn advice into your China journey.</h3><p>Tell us where you want to go and how you like to travel. We'll help shape a private itinerary around you.</p><Link href="/quote" className="btn">Plan My China Trip →</Link></div></aside></section>
 </main>;
}
