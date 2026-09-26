"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

type Row=Record<string,unknown>;
function Html({value}:{value:unknown}){if(!value)return null;return <div className="tourHtml" dangerouslySetInnerHTML={{__html:String(value)}}/>}
export function generateStaticParams(){return [{slug:"cms-tour"}];}
export default function TourDetail(){
 const params=useParams();const slug=String(params.slug??"");const supabase=useMemo(()=>createClient(),[]);const [tour,setTour]=useState<Row|null>(null);const [days,setDays]=useState<Row[]>([]);const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!slug)return;supabase.from("tours").select("*").eq("slug",slug).eq("is_published",true).maybeSingle().then(async({data})=>{const row=data as Row|null;setTour(row);if(row?.id!=null){const {data:dayRows}=await supabase.from("tour_days").select("*").eq("tour_id",row.id).order("day_number",{ascending:true});setDays((dayRows as Row[]|null)??[]);}setLoading(false);});},[slug,supabase]);
 if(loading)return <main className="tourLoading"><p>Loading your journey…</p></main>;
 if(!tour)return <main className="tourLoading"><div><h1>Journey not found</h1><p>This itinerary may be unpublished or no longer available.</p><Link href="/tours" className="btn">Explore China Tours →</Link></div></main>;
 const title=String(tour.name??tour.title??"China Journey");const image=String(tour.hero_image_url??tour.image_url??tour.cover_image_url??"");const gallery=Array.isArray(tour.gallery_images)?tour.gallery_images.filter(x=>typeof x==="string") as string[]:[];const duration=String(tour.duration_days??tour.duration??tour.days??"");const price=tour.price_from??tour.price;
 return <main><section className="tourHero liveTourHero" style={image?{backgroundImage:"url('"+image+"')"}:undefined}><div><p className="eyebrow">PRIVATE JOURNEY{duration?" · "+duration+" DAYS":""}</p><h1>{title}</h1><p>{String(tour.subtitle??tour.short_description??"A private China journey designed around you.")}</p><div className="pills">{duration&&<span>{duration} Days</span>}<span>Flexible Departure</span>{tour.destination&&<span>{String(tour.destination)}</span>}</div></div></section>
 <section className="section detailLayout"><div><h2>Journey overview</h2><Html value={tour.description??tour.content}/>{gallery.length>0&&<div className="liveTourGallery">{gallery.map((url,i)=><img src={url} alt={title+" gallery "+(i+1)} key={url+i}/>)}</div>}
 {tour.highlights&&<><h2>Trip highlights</h2><p className="bigp">{String(tour.highlights)}</p></>}
 <h2>Day by day</h2>{days.length?days.map((d,i)=><div className="day" key={String(d.id??i)}><b>DAY {String(d.day_number??i+1)}</b><div><h3>{String(d.title??"Today's journey")}</h3>{d.image_url&&<img src={String(d.image_url)} alt="" style={{width:"100%",maxHeight:320,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}<p>{String(d.description??d.content??"")}</p>{d.attractions&&<p><strong>Highlights:</strong> {String(d.attractions)}</p>}{d.meals&&<p><strong>Meals:</strong> {String(d.meals)}</p>}{d.hotel&&<p><strong>Hotel:</strong> {String(d.hotel)}</p>}</div></div>):<p>Your day-by-day itinerary will be tailored to your travel dates and preferences.</p>}
 {tour.included&&<><h2>What's included</h2><Html value={tour.included}/></>}{tour.excluded&&<><h2>Not included</h2><Html value={tour.excluded}/></>}{tour.important_notes&&<><h2>Good to know</h2><Html value={tour.important_notes}/></>}</div>
 <aside className="quoteCard"><small>TAILOR THIS TRIP</small><h3>Make it your journey</h3>{price!=null&&<p className="tourPrice">From {String(tour.currency??"CNY")} {String(price)}</p>}<p>Tell us your dates, group size and preferences. We'll prepare a personalized proposal.</p><Link href="/quote" className="btn">Get My Trip Plan →</Link><hr/><p className="muted">No forced shopping · Clear inclusions · Flexible itinerary</p></aside></section></main>
}