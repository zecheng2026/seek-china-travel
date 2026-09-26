"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import ManagedHero from "../components/ManagedHero";

type Tour=Record<string,unknown>;
function plainText(value:unknown){return String(value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}\nfunction money(value:unknown){const n=Number(value);return Number.isFinite(n)?new Intl.NumberFormat("en-US").format(n):String(value??"");}
export default function Tours(){
 const supabase=useMemo(()=>createClient(),[]);const [items,setItems]=useState<Tour[]>([]);const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.from("tours").select("*").eq("is_published",true).order("sort_order",{ascending:true}).then(({data})=>{setItems((data as Tour[]|null)??[]);setLoading(false);});},[supabase]);
 return <main className="journeysPage">
  <ManagedHero pageKey="tours" className="toursManagedHero" defaults={{eyebrow:"CURATED PRIVATE JOURNEYS",title:"See China differently.",subtitle:"Thoughtfully designed journeys, local expertise and the freedom to make every trip your own.",image:"/images/china-hero.jpg",overlay:48}} />
  <section className="journeysIntro"><div><p className="journeysKicker">EXPLORE OUR JOURNEYS</p><h2>Find your way through China</h2></div><p>Start with one of our signature itineraries. Every journey can be adjusted around your dates, pace and interests.</p></section>
  <section className="journeysGridWrap">{loading?<div className="tourLoading"><p>Loading China journeys…</p></div>:items.length===0?<div className="tourLoading"><div><h2>New journeys are coming soon.</h2><p>Tell us where you want to go and we will create a private China itinerary for you.</p><Link href="/quote" className="btn">Plan My Trip →</Link></div></div>:<div className="journeysGrid">{items.map((tour,i)=>{const title=String(tour.name??tour.title??"China Journey");const slug=String(tour.slug??"");const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??"");const days=String(tour.duration_days??tour.duration??tour.days??"");const destination=String(tour.destination??"China");return <article className="journeyCard" key={String(tour.id??slug??i)}><Link className="journeyVisual" href={"/tour?slug="+encodeURIComponent(slug)} style={image?{backgroundImage:"url('"+image+"')"}:undefined}><div className="journeyBadges"><span>{destination}</span>{days&&<span>{days} Days</span>}</div><span className="journeyArrow">↗</span></Link><div className="journeyCardBody"><p className="journeyType">PRIVATE JOURNEY</p><h3><Link href={"/tour?slug="+encodeURIComponent(slug)}>{title}</Link></h3><p className="journeyDesc">{plainText(tour.description??tour.content??tour.subtitle??"A thoughtfully designed China journey with flexible private service.").slice(0,155)}</p><div className="journeyCardFoot">{tour.price_from!=null?<div><small>FROM</small><strong>{String(tour.currency??"CNY")} {money(tour.price_from)}</strong><span> / person</span></div>:<div><small>TAILORED TO YOU</small><strong>Custom quote</strong></div>}<Link className="journeyLink" href={"/tour?slug="+encodeURIComponent(slug)}>View journey <b>→</b></Link></div></div></article>})}</div>}</section>
  <section className="journeysCta"><p className="journeysKicker">YOUR CHINA, YOUR WAY</p><h2>Not sure which journey fits?</h2><p>Tell us what you want to experience. Our China travel specialists will shape a private itinerary around you.</p><Link href="/quote" className="btn">Plan My China Trip →</Link></section>
 </main>;
}
