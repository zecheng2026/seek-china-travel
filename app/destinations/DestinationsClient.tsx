"use client";
import Link from "next/link";
import ManagedHero from "../components/ManagedHero";

type Row=Record<string,unknown>;
const fallback=[["Beijing","Imperial history & the Great Wall"],["Xi'an","Ancient China & Terracotta Warriors"],["Zhangjiajie","Otherworldly mountains & nature"],["Chengdu","Pandas, tea houses & Sichuan life"],["Chongqing","Mountain-city energy & karst scenery"],["Guilin","Rivers, limestone peaks & countryside"]];
function plain(v:unknown){return String(v??"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim()}
export default function Destinations({initialItems,initialTours}:{initialItems:Row[];initialTours:Row[]}){
 const display:Row[]=initialItems.length?initialItems:fallback.map((d,i)=>({name:d[0],short_description:d[1],slug:String(d[0]).toLowerCase().replace(/[^a-z0-9]+/g,"-"),id:i}));
 return <main>
 <section className="destinationIndex destinationIndexRich destinationCatalogPage">
  <header className="destinationCatalogIntro">
   <h1>Most Popular Travel Destinations</h1>
   <p>Below are beautiful and most famous Chinese tourist destinations in the list of must-check-in places when visiting China for the first time.</p>
  </header>
  <div className="destinationCatalogGrid">{display.map((d,i)=>{
   const name=String(d.name??"China");
   const image=String(d.hero_image_url??d.image_url??d.cover_image_url??"");
   return <Link href={"/destinations/"+encodeURIComponent(String(d.slug??name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))} className="destinationCatalogCard" key={String(d.id??i)} style={image?{backgroundImage:"url('"+image+"')",backgroundPosition:`${Number(d.image_position_x??50)}% ${Number(d.image_position_y??50)}%`}:undefined} aria-label={`Explore ${name}`}>
    <span className="destinationCatalogShade"/><h2>{name}</h2>
   </Link>;
  })}</div>
 </section>
 <section className="v1Section v1Soft destinationFeaturedTours">
  <header className="v1SectionHead"><div><p className="v1Eyebrow red">HANDPICKED JOURNEYS</p><h2>China trips travelers love</h2></div><Link href="/tours">See all tours →</Link></header>
  <div className="v1TourGrid">{initialTours.map((tour:any,index:number)=>{
   const title=String(tour.name??tour.title??"China Journey");
   const slug=String(tour.slug??"");
   const href=slug?"/tours/"+encodeURIComponent(slug):"/tours";
   const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??tour.image??"");
   const place=String(tour.destination??tour.place??"China");
   const days=String(tour.duration_days?tour.duration_days+" Days":tour.days??"");
   const description=plain(tour.description??tour.subtitle??"A thoughtfully designed private China journey.").slice(0,150);
   return <article className="v1Tour" key={String(tour.id??title??index)}>
    <Link href={href} className="v1TourImage" aria-label={"View "+title+" itinerary"} style={image?{backgroundImage:`linear-gradient(180deg,transparent 55%,rgba(3,31,57,.68)),url("${image}")`,backgroundPosition:`${Number(tour.image_position_x??50)}% ${Number(tour.image_position_y??50)}%`}:undefined}><span>{place}</span></Link>
    <div className="v1TourBody"><small>{days} · PRIVATE TOUR</small><h3>{title}</h3><p>{description}</p><Link href={href}>View journey →</Link></div>
   </article>;
  })}</div>
 </section>
 <section className="destinationPromise"><div><p className="v1Eyebrow">TRAVEL CHINA YOUR WAY</p><h2>Not sure where to begin?</h2><p>Tell us what you love — culture, food, landscapes, cities or a little of everything. Our local team can connect the right destinations into one seamless private journey.</p><Link href="/quote" className="pillButton white">Plan My China Trip →</Link></div><div className="destinationPromiseFacts"><span><b>Private</b><small>Designed around you</small></span><span><b>Flexible</b><small>Your dates & pace</small></span><span><b>Local</b><small>China-based expertise</small></span></div></section>
 </main>;
}
