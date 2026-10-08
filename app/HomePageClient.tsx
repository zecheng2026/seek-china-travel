"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import ManagedHero from "./components/ManagedHero";
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

export default function Home() {
  const supabase=useMemo(()=>createClient(),[]); const [liveTours,setLiveTours]=useState<Record<string,unknown>[]>([]); const [liveDestinations,setLiveDestinations]=useState<Record<string,unknown>[]>([]); const [liveGuides,setLiveGuides]=useState<Record<string,unknown>[]>([]); const [reviews,setReviews]=useState<Record<string,unknown>[]>([]);
  useEffect(()=>{Promise.all([supabase.from("tours").select("*").eq("is_published",true).eq("is_featured",true).order("sort_order",{ascending:true}).limit(3),supabase.from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true}).limit(6),supabase.from("travel_guides").select("*").eq("is_featured",true).eq("is_published",true).limit(3),supabase.from("homepage_sections").select("content").eq("section_key","home:reviews").maybeSingle()]).then(([t,d,g,r])=>{setLiveTours((t.data as Record<string,unknown>[]|null)??[]);setLiveDestinations((d.data as Record<string,unknown>[]|null)??[]);setLiveGuides((g.data as Record<string,unknown>[]|null)??[]);if(r.data?.content)try{const x=typeof r.data.content==="string"?JSON.parse(r.data.content):r.data.content;setReviews(Array.isArray(x?.reviews)?x.reviews.filter((v:any)=>v?.published!==false&&String(v?.text??"").trim()).slice(0,3):[])}catch{}});},[supabase]);
  return <main>
    <ManagedHero pageKey="home" className="homeManagedHero" defaults={{eyebrow:"DISCOVER CHINA. YOUR WAY.",title:"Explore Real China",subtitle:"Tailor-made China journeys designed around your pace, interests and travel style.",image:"",overlay:48,button_text:"Plan Your China Trip",button_link:"/quote"}} />



    <h1 style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0}}>Private &amp; Tailor-Made China Tours | SEEK CHINA TRAVEL</h1>
    <section className="v1Section">
      <header className="v1SectionHead"><div><p className="v1Eyebrow red">POPULAR DESTINATIONS</p><h2>Where will China take you?</h2></div><Link href="/destinations">View all destinations →</Link></header>
      <div className="v1DestinationGrid">{(liveDestinations.length?liveDestinations:destinations).map((item:any,index:number)=>{const name=String(item.name??item.title??"China");const image=String(item.hero_image_url??item.image_url??item.cover_image_url??item.image??"");return <Link href={"/destinations/"+encodeURIComponent(String(item.slug??name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))} className="v1Destination" key={String(item.id??name??index)} style={image?{backgroundImage:"linear-gradient(180deg,transparent 35%,rgba(3,31,57,.88)),url('"+image+"')",backgroundPosition:`${Number(item.image_position_x??50)}% ${Number(item.image_position_y??50)}%`}:undefined}><span>Explore</span><h3>{name}</h3></Link>})}</div>
    </section>

    <section className="v1Section v1Soft">
      <header className="v1SectionHead"><div><p className="v1Eyebrow red">HANDPICKED JOURNEYS</p><h2>China trips travelers love</h2></div><Link href="/tours">See all tours →</Link></header>
      <div className="v1TourGrid">{(liveTours.length?liveTours:tours).map((tour:any,index:number)=>{const title=String(tour.name??tour.title??"China Journey");const slug=String(tour.slug??"");const tourHref=slug?"/tours/"+encodeURIComponent(slug):"/tours";const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??tour.image??"");const place=String(tour.destination??tour.place??"China");const days=String(tour.duration_days?tour.duration_days+" Days":tour.days??"");const description=String(tour.description??tour.subtitle??"A thoughtfully designed private China journey.").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim().slice(0,150);return <article className="v1Tour" key={String(tour.id??title??index)}><Link href={tourHref} className="v1TourImage" aria-label={"View "+title+" itinerary"} style={image?{backgroundImage:"linear-gradient(180deg,transparent 55%,rgba(3,31,57,.68)),url('"+image+"')",backgroundPosition:`${Number(tour.image_position_x??50)}% ${Number(tour.image_position_y??50)}%`}:undefined}><span>{place}</span></Link><div className="v1TourBody"><small>{days} · PRIVATE TOUR</small><h3>{title}</h3><p>{description}</p><Link href={tourHref}>View journey →</Link></div></article>})}</div>
    </section>

    <section className="v1Section v1Why"><p className="v1Eyebrow red">WHY TRAVEL WITH SCT</p><h2>China made simple, personal and memorable.</h2><div className="v1Features"><article><b>01</b><h3>Local expertise</h3><p>Travel with specialists who understand the destinations, logistics and culture.</p></article><article><b>02</b><h3>Designed around you</h3><p>Adjust hotels, pace, experiences and destinations before you confirm.</p></article><article><b>03</b><h3>Support throughout</h3><p>One travel team from planning through the end of your China journey.</p></article><article><b>04</b><h3>Clear pricing</h3><p>Know what is included before booking, with no forced shopping stops.</p></article></div></section>

    

    {reviews.length>0&&<section className="v1Section v1Reviews v1JourneyStories">
      <header className="v1StoryHeading">
        <div><p className="v1Eyebrow red">TRAVELER REVIEWS &amp; STORIES</p><h2>Real Journeys. Real Stories.</h2><p className="v1StoryIntro">Every China journey is different. Hear from travelers who explored the cities, landscapes and culture of China with SCT.</p></div>
        <Link className="v1StoryHeaderLink" href="/quote">Plan your own journey →</Link>
      </header>
      <div className="v1JourneyStoryGrid">{reviews.map((r,i)=>{
        const traveler=String(r.name??"Traveler").trim()||"Traveler";
        const country=String(r.country??"").trim();
        const route=String(r.route??"").trim();
        const destinations=route.split(/\s*(?:→|➝|·|,|\/|\\|\||;|–|—)\s*/).map(x=>x.trim()).filter(Boolean).slice(0,6);
        const duration=String(r.duration_days??r.days??"").trim();
        const rating=Number(r.rating);
        const validRating=r.rating!==undefined&&r.rating!==null&&r.rating!==""&&Number.isInteger(rating)&&rating>=1&&rating<=5;
        const photos=Array.isArray(r.images)?r.images.filter((src:unknown)=>typeof src==="string"&&src.trim()).slice(0,3):[];
        return <article className="v1JourneyStory" key={String(r.id??i)}>
          <div className="v1JourneyStoryTop"><span className="v1JourneyStoryLabel">CHINA JOURNEY {String(i+1).padStart(2,"0")}</span>{validRating&&<span className="v1Stars" aria-label={rating+" out of 5 stars"}>{"★".repeat(rating)}{"☆".repeat(5-rating)}</span>}</div>
          {route&&<h3>{route}</h3>}
          {(destinations.length>1||duration)&&<div className="v1JourneyTags">{duration&&<span>{duration}{/^\d+$/.test(duration)?" Days":""}</span>}{destinations.length>1&&destinations.map((city,n)=><span key={n}>{city}</span>)}</div>}
          <blockquote>“{String(r.text??"").trim()}”</blockquote>
          {photos.length>0&&<div className="v1ReviewShots">{photos.map((src:unknown,n:number)=><div className="v1ReviewShot" key={n}><img src={String(src)} alt={"Review attachment from "+traveler+" "+(n+1)} loading="lazy"/>{n===2&&Array.isArray(r.images)&&r.images.length>3&&<span>+{r.images.length-3}</span>}</div>)}</div>}
          <footer><b>{traveler}</b>{country&&<span>{country}</span>}</footer>
        </article>
      })}</div>
      <div className="v1JourneyStoryBottom"><p>Your journey will have its own story. Let us help you plan it.</p><Link href="/quote" className="v1StoryButton">Start Planning Your Trip →</Link></div>
    </section>}

    <section className="v1Section" id="guide"><header className="v1SectionHead"><div><p className="v1Eyebrow red">CHINA TRAVEL GUIDE</p><h2>Know before you go</h2></div><Link href="/travel-guide">View all guides →</Link></header>{liveGuides.length>0&&<div className="v1GuideGrid v1GuideImageGrid">{liveGuides.map((g,i)=>{const image=String(g.hero_image_url??g.image_url??g.cover_image_url??"");return <Link href={"/travel-guide/"+encodeURIComponent(String(g.slug??""))} key={String(g.id??i)} className="v1GuideLink"><article>{image&&<img src={image} alt={String(g.title??g.name??"China Travel Guide")} style={{objectPosition:`${Number(g.image_position_x??50)}% ${Number(g.image_position_y??50)}%`}}/>}<div><small>{String(g.category??"TRAVEL GUIDE").toUpperCase()}</small><h3>{String(g.title??g.name??"China Travel Guide")}</h3><p>{String(g.summary??g.short_description??g.description??"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim().slice(0,145)}</p><span>Read guide →</span></div></article></Link>})}</div>}</section>

    <section className="v1Section v1Process v1CompactCta"><p className="v1Eyebrow">YOUR CHINA JOURNEY STARTS HERE</p><h2>Your China Trip, Your Way.</h2><p className="v1CompactCtaText">Tell us your travel dates, interests, and destinations. We’ll create a personalized China itinerary just for you.</p><Link href="/quote" className="pillButton">Start Planning Your Trip →</Link></section>
  </main>;
}
