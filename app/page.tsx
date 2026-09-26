"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import ManagedHero from "./components/ManagedHero";
import {createClient} from "../utils/supabase/client";

// Placeholder photography is centralized here so the final client images are easy to replace.
const images = {
  hero: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2200&q=86", // HERO IMAGE
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
  { title: "Chongqing Mountain City", days: "4 Days", place: "Chongqing · Wulong", description: "Cyberpunk skyline, hotpot culture and spectacular karst landscapes.", image: images.chongqing, slug: "china-classic" },
];

export default function Home() {
  const supabase=useMemo(()=>createClient(),[]); const [liveTours,setLiveTours]=useState<Record<string,unknown>[]>([]); const [liveDestinations,setLiveDestinations]=useState<Record<string,unknown>[]>([]);
  useEffect(()=>{Promise.all([supabase.from("tours").select("*").eq("is_published",true).order("sort_order",{ascending:true}).limit(3),supabase.from("destinations").select("*").eq("is_active",true).order("sort_order",{ascending:true}).limit(6)]).then(([t,d])=>{setLiveTours((t.data as Record<string,unknown>[]|null)??[]);setLiveDestinations((d.data as Record<string,unknown>[]|null)??[]);});},[supabase]);
  return <main>
    <ManagedHero pageKey="home" className="homeManagedHero" defaults={{eyebrow:"DISCOVER CHINA. YOUR WAY.",title:"Explore Real China",subtitle:"Tailor-made China journeys designed around your pace, interests and travel style.",image:images.hero,overlay:48,button_text:"Plan Your China Trip",button_link:"/quote"}} />

    <nav className="v1Search" aria-label="Start planning a China journey">
      <Link href="/quote"><small>WHERE</small><b>Choose a destination</b><span>⌄</span></Link>
      <Link href="/quote"><small>WHEN</small><b>Your travel dates</b><span>⌄</span></Link>
      <Link href="/quote"><small>TRAVELERS</small><b>2 Guests</b><span>⌄</span></Link>
      <Link href="/quote" className="v1SearchButton">Explore Trips <span>→</span></Link>
    </nav>

    <section className="v1Section">
      <header className="v1SectionHead"><div><p className="v1Eyebrow red">POPULAR DESTINATIONS</p><h2>Where will China take you?</h2></div><Link href="/destinations">View all destinations →</Link></header>
      <div className="v1DestinationGrid">{(liveDestinations.length?liveDestinations:destinations).map((item:any,index:number)=>{const name=String(item.name??item.title??"China");const image=String(item.hero_image_url??item.image_url??item.cover_image_url??item.image??"");return <Link href={"/destination?slug="+encodeURIComponent(String(item.slug??name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))} className="v1Destination" key={String(item.id??name??index)} style={image?{backgroundImage:"linear-gradient(180deg,transparent 35%,rgba(3,31,57,.88)),url('"+image+"')"}:undefined}><span>Explore</span><h3>{name}</h3></Link>})}</div>
    </section>

    <section className="v1Section v1Soft">
      <header className="v1SectionHead"><div><p className="v1Eyebrow red">HANDPICKED JOURNEYS</p><h2>China trips travelers love</h2></div><Link href="/tours">See all tours →</Link></header>
      <div className="v1TourGrid">{(liveTours.length?liveTours:tours).map((tour:any,index:number)=>{const title=String(tour.name??tour.title??"China Journey");const slug=String(tour.slug??"");const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??tour.image??"");const place=String(tour.destination??tour.place??"China");const days=String(tour.duration_days?tour.duration_days+" Days":tour.days??"");const description=String(tour.description??tour.subtitle??"A thoughtfully designed private China journey.").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim().slice(0,150);return <article className="v1Tour" key={String(tour.id??title??index)}><Link href={"/tour?slug="+encodeURIComponent(slug)} className="v1TourImage" style={image?{backgroundImage:"linear-gradient(180deg,transparent 55%,rgba(3,31,57,.68)),url('"+image+"')"}:undefined}><span>{place}</span></Link><div className="v1TourBody"><small>{days} · PRIVATE TOUR</small><h3>{title}</h3><p>{description}</p><Link href={"/tour?slug="+encodeURIComponent(slug)}>View journey →</Link></div></article>})}</div>
    </section>

    <section className="v1Section v1Why"><p className="v1Eyebrow red">WHY TRAVEL WITH SCT</p><h2>China made simple, personal and memorable.</h2><div className="v1Features"><article><b>01</b><h3>Local expertise</h3><p>Travel with specialists who understand the destinations, logistics and culture.</p></article><article><b>02</b><h3>Designed around you</h3><p>Adjust hotels, pace, experiences and destinations before you confirm.</p></article><article><b>03</b><h3>Support throughout</h3><p>One travel team from planning through the end of your China journey.</p></article><article><b>04</b><h3>Clear pricing</h3><p>Know what is included before booking, with no forced shopping stops.</p></article></div></section>

    <section className="v1Section v1Process"><p className="v1Eyebrow">YOUR TRIP, YOUR WAY</p><h2>From idea to China in four easy steps</h2><div className="v1Steps"><div><b>1</b><span>Tell us your plan</span></div><div><b>2</b><span>Receive your itinerary</span></div><div><b>3</b><span>Confirm your trip</span></div><div><b>4</b><span>Explore China</span></div></div><Link href="/quote" className="pillButton">Start Planning →</Link></section>

    <section className="v1Section" id="guide"><p className="v1Eyebrow red">CHINA TRAVEL GUIDE</p><h2 className="v1StandaloneTitle">Know before you go</h2><div className="v1GuideGrid"><article><small>ESSENTIALS</small><h3>Paying in China</h3><p>What international visitors should know about mobile payments and cards.</p></article><article><small>PLANNING</small><h3>Best time to visit China</h3><p>A practical seasonal guide for different regions and travel styles.</p></article><article><small>GETTING AROUND</small><h3>High-speed rail made easy</h3><p>How to plan comfortable city-to-city travel across China.</p></article></div></section>

    <section className="v1Cta"><p>YOUR CHINA STORY STARTS HERE</p><h2>Ready to discover the real China?</h2><Link href="/quote" className="pillButton white">Plan My China Trip →</Link></section>
  </main>;
}
