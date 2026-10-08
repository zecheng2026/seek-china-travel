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
 useEffect(()=>{if(!slugProp)setRuntimeSlug(new URLSearchParams(window.location.search).get("slug")??"");},[slugProp]);
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
 return <main className="guideDetail">
  <section className="guideDetailHero" style={image?{backgroundImage:"url('"+image+"')",backgroundPosition:imagePosition}:undefined}><div className="journeyHeroShade"/><div className="journeyHeroContent"><Link href="/travel-guide" className="journeyBack">← Travel Guide</Link><p className="journeysKicker">{category.toUpperCase()}</p><h1>{title}</h1>{Boolean(guide.summary??guide.short_description)&&<p>{value(guide.summary??guide.short_description)}</p>}</div></section>
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
