"use client";
import Link from "next/link";
import LazyBackgroundLink from "../components/LazyBackground";
import {useEffect,useState} from "react";

type Row=Record<string,unknown>;
const fallback=[["Beijing","Imperial history & the Great Wall"],["Xi'an","Ancient China & Terracotta Warriors"],["Zhangjiajie","Otherworldly mountains & nature"],["Chengdu","Pandas, tea houses & Sichuan life"],["Chongqing","Mountain-city energy & karst scenery"],["Guilin","Rivers, limestone peaks & countryside"]];
function plain(v:unknown){return String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
export default function Destinations({initialItems,initialTours}:{initialItems:Row[];initialTours:Row[]}){
 const display:Row[]=initialItems.length?initialItems:fallback.map((d,i)=>({name:d[0],short_description:d[1],slug:String(d[0]).toLowerCase().replace(/[^a-z0-9]+/g,"-"),id:i}));
 const [columns,setColumns]=useState(4);
 const [page,setPage]=useState(1);
 useEffect(()=>{
  const update=()=>setColumns(window.innerWidth<=380?1:window.innerWidth<=760?2:window.innerWidth<=1050?3:4);
  update();window.addEventListener("resize",update);return ()=>window.removeEventListener("resize",update);
 },[]);
 const pageSize=columns*6;
 const totalPages=Math.ceil(display.length/pageSize);
 const currentPage=Math.min(page,Math.max(1,totalPages));
 const visible=display.slice((currentPage-1)*pageSize,currentPage*pageSize);
 const changePage=(next:number)=>{setPage(next);document.getElementById("destination-catalog-heading")?.scrollIntoView({behavior:"smooth",block:"start"});};
 return <main>
 <section className="destinationIndex destinationIndexRich destinationCatalogPage">
  <header className="destinationCatalogIntro">
   <h1 id="destination-catalog-heading">Most Popular Travel Destinations</h1>
   <p>Below are beautiful and most famous Chinese tourist destinations in the list of must-check-in places when visiting China for the first time.</p>
  </header>
  <div className="destinationCatalogGrid">{visible.map((d,i)=>{
   const name=String(d.name??"China");
   const image=String(d.hero_image_url??d.image_url??d.cover_image_url??"");
   return <LazyBackgroundLink href={"/destinations/"+encodeURIComponent(String(d.slug??name.toLowerCase().replace(/[^a-z0-9]+/g,"-")))} className="destinationCatalogCard" key={String(d.id??i)} image={image} position={`${Number(d.image_position_x??50)}% ${Number(d.image_position_y??50)}%`} label={`Explore ${name}`}> 
    <span className="destinationCatalogShade"/><h2>{name}</h2>
   </LazyBackgroundLink>;
  })}</div>
  {totalPages>1&&<nav className="destinationCatalogPagination" aria-label="Destination pages">
   <button type="button" disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}>Previous</button>
   {Array.from({length:totalPages},(_,i)=>i+1).map(n=><button key={n} type="button" className={n===currentPage?"isActive":""} aria-label={`Page ${n}`} aria-current={n===currentPage?"page":undefined} onClick={()=>changePage(n)}>{n}</button>)}
   <button type="button" disabled={currentPage===totalPages} onClick={()=>changePage(currentPage+1)}>Next</button>
  </nav>}
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
