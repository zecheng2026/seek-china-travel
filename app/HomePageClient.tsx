"use client";
import Link from "next/link";
import {useEffect,useMemo,useRef,useState} from "react";
import ManagedHero from "./components/ManagedHero";
import TravelerReviews from "./components/TravelerReviews";
import {createClient} from "../utils/supabase/client";

// Placeholder photography is centralized here so the final client images are easy to replace.
const images = {
  hero: "", // HERO IMAGE is loaded from the admin configuration; keep empty to prevent legacy-image flash
  beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=82", // BEIJING IMAGE
  xian: "https://images.unsplash.com/photo-1591122947157-26bad3a117d2?auto=format&fit=crop&w=1200&q=82", // XI'AN IMAGE
  zhangjiajie: "https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1200&q=82", // ZHANGJIAJIE IMAGE
  chengdu: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1200&q=82", // CHENGDU IMAGE
  chongqing: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1200&q=82", // CHONGQING IMAGE
  guilin: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=82", // GUILIN IMAGE
};

const destinations = [
  { name: "Beijing", image: images.beijing },
  { name: "Xi'an", image: images.xian },
  { name: "Zhangjiajie", image: images.zhangjiajie },
  { name: "Chengdu", image: images.chengdu },
  { name: "Chongqing", image: images.chongqing },
  { name: "Guilin", image: images.guilin },
];

const tours = [
  { title: "Zhangjiajie Avatar Mountains", days: "5 Days", place: "Zhangjiajie", description: "Dramatic sandstone peaks, glass bridges and a relaxed private itinerary.", image: images.zhangjiajie, slug: "zhangjiajie-5-day" },
  { title: "Beijing & Xi'an Classics", days: "7 Days", place: "Beijing · Xi'an", description: "Great Wall, Forbidden City and Terracotta Warriors with private local guides.", image: images.beijing, slug: "china-classic" },
  { title: "Chongqing Mountain City", days: "4 Days", place: "Chongqing · Wulong", description: "Cyberpunk skyline, hotpot culture and spectacular karst landscapes.", image: images.chongqing, slug: "" },
];

function DeferredImageLink({href,className,image,position,gradient,children,...rest}:{href:string;className:string;image:string;position:string;gradient:string;children:React.ReactNode;"aria-label"?:string}){
 const ref=useRef<HTMLAnchorElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const node=ref.current;if(!node)return;
  if(!("IntersectionObserver" in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:"250px 0px"});
  observer.observe(node);return()=>observer.disconnect();
 },[]);
 return <Link ref={ref} href={href} className={className} {...rest} style={visible&&image?{backgroundImage:`linear-gradient(${gradient}),url("${image}")`,backgroundPosition:position}:undefined}>{children}</Link>;
}

export default function Home() {
  const supabase=useMemo(()=>createClient(),[]); const [liveTours,setLiveTours]=useState<Record<string,unknown>[]>([]); const [liveDestinations,setLiveDestinations]=useState<Record<string,unknown>[]>([]); const [liveGuides,setLiveGuides]=useState<Record<string,unknown>[]>([]); const [reviews,setReviews]=useState<Record<string,unknown>[]>([]); const [contentLoaded,setContentLoaded]=useState(false); const [toursError,setToursError]=useState(false); const [destinationsError,setDestinationsError]=useState(false);
  const destinationCarouselRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
   const el=destinationCarouselRef.current;
   const n=liveDestinations.length;
   if(!el||n<2)return;
   const mobile=window.matchMedia("(max-width:600px)");
   const cards=()=>Array.from(el.querySelectorAll<HTMLElement>(".v1Destination"));
   const cardCenter=(card:HTMLElement)=>card.offsetLeft+card.offsetWidth/2;
   const updateActive=()=>{
    if(!mobile.matches)return;
    const list=cards(),center=el.scrollLeft+el.clientWidth/2;
    let closest:HTMLElement|null=null,dist=Infinity;
    list.forEach(card=>{const d=Math.abs(cardCenter(card)-center);if(d<dist){dist=d;closest=card;}});
    list.forEach(card=>card.classList.toggle("homeDestinationCentered",card===closest));
   };
   const jump=(left:number)=>{
    const previousSnap=el.style.scrollSnapType,previousBehavior=el.style.scrollBehavior;
    el.style.scrollSnapType="none";el.style.scrollBehavior="auto";
    el.scrollLeft=left;
    updateActive();
    requestAnimationFrame(()=>{el.style.scrollSnapType=previousSnap;el.style.scrollBehavior=previousBehavior;});
   };
   const start=()=>{
    if(!mobile.matches)return;
    const list=cards();if(list.length!==n*3)return;
    jump(cardCenter(list[n])-el.clientWidth/2);
   };
   let ticking=false;
   const onScroll=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{ticking=false;updateActive();});
   };
   const onScrollEnd=()=>{
    if(!mobile.matches)return;
    const list=cards();if(list.length!==n*3)return;
    const stride=list[n].offsetLeft-list[0].offsetLeft;
    if(!stride)return;
    const center=el.scrollLeft+el.clientWidth/2;
    if(center<cardCenter(list[n])-(stride/2))jump(el.scrollLeft+stride);
    else if(center>cardCenter(list[n*2])-(stride/2))jump(el.scrollLeft-stride);
    else updateActive();
   };
   const frame=requestAnimationFrame(start);
   el.addEventListener("scroll",onScroll,{passive:true});
   el.addEventListener("scrollend",onScrollEnd);
   window.addEventListener("resize",start);
   return()=>{cancelAnimationFrame(frame);el.removeEventListener("scroll",onScroll);el.removeEventListener("scrollend",onScrollEnd);window.removeEventListener("resize",start);};
  },[liveDestinations]);
  useEffect(()=>{Promise.all([supabase.from("tours").select("*").eq("is_published",true).eq("is_featured",true).order("sort_order",{ascending:true}).limit(3),supabase.from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true}).limit(6),supabase.from("travel_guides").select("*").eq("is_featured",true).eq("is_published",true).limit(3),supabase.from("homepage_sections").select("content").eq("section_key","home:reviews").maybeSingle(),supabase.from("traveler_reviews").select("id,name,body,rating,featured_home,created_at,avatar_url").eq("status","approved").eq("featured_home",true).order("created_at",{ascending:false}).limit(3)]).then(([t,d,g,r,featured])=>{setToursError(Boolean(t.error));setDestinationsError(Boolean(d.error));setLiveTours((t.data as Record<string,unknown>[]|null)??[]);setLiveDestinations((d.data as Record<string,unknown>[]|null)??[]);setLiveGuides((g.data as Record<string,unknown>[]|null)??[]);try{const x=typeof r.data?.content==="string"?JSON.parse(r.data.content):r.data?.content;setReviews([...(featured.data??[]).map((v:any)=>({name:v.name,text:v.body,rating:v.rating,avatar_url:v.avatar_url,published:true,images:[]})),...(Array.isArray(x?.reviews)?x.reviews.filter((v:any)=>v?.published!==false&&String(v?.text??"").trim()):[])].slice(0,3))}catch{}finally{setContentLoaded(true)}}).catch(()=>{setToursError(true);setDestinationsError(true);setContentLoaded(true)});},[supabase]);
  return <main>
    <ManagedHero pageKey="home" className="homeManagedHero" defaults={{eyebrow:"DISCOVER CHINA. YOUR WAY.",title:"Explore Real China",subtitle:"Tailor-made China journeys designed around your pace, interests and travel style.",image:"",overlay:48,button_text:"Plan Your China Trip",button_link:"/quote"}} />



    <h1 style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0}}>Private &amp; Tailor-Made China Tours | SEEK CHINA TRAVEL</h1>
    <section className="v1Section">
      <style>{`@media(max-width:650px){.homeMobileWideHead{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important}.homeMobileWideHead>div{display:block!important;flex:none!important;width:100%!important;max-width:100%!important;min-width:0!important}.homeMobileWideHead h2{width:100%!important;max-width:100%!important;overflow-wrap:normal!important;white-space:normal!important}.homeMobileWideHead>a{align-self:flex-start!important;margin-top:0!important}}`}</style>
      <header className="v1SectionHead homeMobileWideHead homeDestinationsHead"><div><p className="v1Eyebrow red">POPULAR DESTINATIONS</p><h2 className="homeDestinationsDesktopTitle">Where will China take you?</h2><h2 className="homeDestinationsMobileTitle">China Top Destinations</h2><p className="homeDestinationsMobileSubtitle">Discover the enchanting landscapes of China — towering sandstone pillars, mist-shrouded peaks, and breathtaking natural wonders.</p></div><Link href="/destinations">View all destinations →</Link></header>
      <div className="v1DestinationGrid" ref={destinationCarouselRef}>{contentLoaded&&destinationsError&&<p role="status">Destinations are temporarily unavailable. Please refresh the page to try again.</p>}{!contentLoaded&&Array.from({length:6},(_,i)=><div key={i} className="v1Destination" aria-hidden="true" style={{background:"#e8edf1"}}/>)}{(contentLoaded&&!destinationsError?(liveDestinations.length>1?[...liveDestinations,...liveDestinations,...liveDestinations]:liveDestinations):[]).map((item:any,index:number)=>{const name=String(item.name??item.title??"China");const image=String(item.hero_image_url??item.image_url??item.cover_image_url??item.image??"");const description=String(item.subtitle??item.short_description??item.description??item.overview??"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim();return <DeferredImageLink href={"/destinations/"+encodeURIComponent(String(item.slug??name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))} className={"v1Destination"+(index>=liveDestinations.length&&liveDestinations.length>1?" homeDestinationClone":"")} key={String(item.id??name)+"-"+index} image={image} gradient="180deg,transparent 35%,rgba(3,31,57,.88)" position={`${Number(item.image_position_x??50)}% ${Number(item.image_position_y??50)}%`}><span>Explore</span><h3>{name}</h3>{description&&<p className="homeDestinationDescription">{description}</p>}</DeferredImageLink>})}</div><Link href="/destinations" className="homeDestinationMobileAll">View All Destinations <span aria-hidden="true">→</span></Link>
    </section>

    <section className="v1Section v1Soft">
      <header className="v1SectionHead homeMobileWideHead"><div><p className="v1Eyebrow red">HANDPICKED JOURNEYS</p><h2>China trips travelers love</h2></div><Link href="/tours">See all tours →</Link></header>
      <div className="v1TourGrid">{contentLoaded&&toursError&&<p role="status">Some journeys may be temporarily unavailable. Please refresh the page to try again.</p>}{!contentLoaded&&Array.from({length:3},(_,i)=><div key={i} className="v1Tour" aria-hidden="true" style={{minHeight:320,background:"#e8edf1"}}/>)}{(contentLoaded&&!toursError?liveTours:[]).map((tour:any,index:number)=>{const title=String(tour.name??tour.title??"China Journey");const slug=String(tour.slug??"");const tourHref=slug?"/tours/"+encodeURIComponent(slug):"/tours";const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??tour.image??"");const place=String(tour.destination??tour.place??"China");const days=String(tour.duration_days?tour.duration_days+" Days":tour.days??"");const description=String(tour.description??tour.subtitle??"A thoughtfully designed private China journey.").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim().slice(0,150);return <article className="v1Tour" key={String(tour.id??title??index)}><DeferredImageLink href={tourHref} className="v1TourImage" aria-label={"View "+title+" itinerary"} image={image} gradient="180deg,transparent 55%,rgba(3,31,57,.68)" position={`${Number(tour.image_position_x??50)}% ${Number(tour.image_position_y??50)}%`}><span>{place}</span></DeferredImageLink><div className="v1TourBody"><small>{days} · PRIVATE TOUR</small><h3>{title}</h3><p>{description}</p><Link href={tourHref}>View journey →</Link></div></article>})}</div>
    </section>

    <section className="v1Section v1Why"><p className="v1Eyebrow red">WHY TRAVEL WITH SCT</p><h2>China made simple, personal and memorable.</h2><div className="v1Features"><article><b>01</b><h3>Local expertise</h3><p>Travel with specialists who understand the destinations, logistics and culture.</p></article><article><b>02</b><h3>Designed around you</h3><p>Adjust hotels, pace, experiences and destinations before you confirm.</p></article><article><b>03</b><h3>Support throughout</h3><p>One travel team from planning through the end of your China journey.</p></article><article><b>04</b><h3>Clear pricing</h3><p>Know what is included before booking, with no forced shopping stops.</p></article></div></section>

    

    <TravelerReviews reviews={reviews} />

    <section className="v1Section" id="guide"><header className="v1SectionHead"><div><p className="v1Eyebrow red">CHINA TRAVEL GUIDE</p><h2>Know before you go</h2></div><Link href="/travel-guide">View all guides →</Link></header>{liveGuides.length>0&&<div className="v1GuideGrid v1GuideImageGrid">{liveGuides.map((g,i)=>{const image=String(g.hero_image_url??g.image_url??g.cover_image_url??"");return <Link href={"/travel-guide/"+encodeURIComponent(String(g.slug??""))} key={String(g.id??i)} className="v1GuideLink"><article>{image&&<img src={image} loading="lazy" decoding="async" alt={String(g.title??g.name??"China Travel Guide")} style={{objectPosition:`${Number(g.image_position_x??50)}% ${Number(g.image_position_y??50)}%`}}/>}<div><small>{String(g.category??"TRAVEL GUIDE").toUpperCase()}</small><h3>{String(g.title??g.name??"China Travel Guide")}</h3><p>{String(g.summary??g.short_description??g.description??"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim().slice(0,145)}</p><span>Read guide →</span></div></article></Link>})}</div>}</section>

    
  </main>;
}
