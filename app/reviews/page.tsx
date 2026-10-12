"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {createClient} from "../../utils/supabase/client";

type Review={id?:string|number;name?:string;country?:string;route?:string;text?:string;rating?:number;images?:string[];published?:boolean};
export default function ReviewsPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;supabase.from("homepage_sections").select("content").eq("section_key","home:reviews").maybeSingle().then(({data})=>{
  if(!alive)return;
  try{const value=typeof data?.content==="string"?JSON.parse(data.content):data?.content;setReviews(Array.isArray(value?.reviews)?value.reviews.filter((r:Review)=>r?.published!==false&&String(r?.text??"").trim()):[])}catch{setReviews([])}
  setLoading(false);
 });return()=>{alive=false}},[supabase]);
 return <main style={{maxWidth:1100,margin:"0 auto",padding:"clamp(90px,12vw,150px) 20px 80px"}}>
  <p className="v1Eyebrow red">SEEK CHINA TRAVEL</p><h1>Traveler Reviews</h1>
  <p>Real journeys, real stories. Discover what travelers say about exploring China with SCT.</p>
  {loading?<p>Loading reviews…</p>:reviews.length===0?<p>Traveler stories will appear here soon.</p>:
  <div className="v1JourneyStoryGrid" style={{marginTop:32}}>{reviews.map((r,i)=><article className="v1JourneyStory" key={String(r.id??i)}>
   <div className="v1JourneyStoryTop"><span className="v1JourneyStoryLabel">TRAVELER STORY {String(i+1).padStart(2,"0")}</span>{Number.isInteger(Number(r.rating))&&Number(r.rating)>=1&&Number(r.rating)<=5&&<span className="v1Stars">{"★".repeat(Number(r.rating))}{"☆".repeat(5-Number(r.rating))}</span>}</div>
   {r.route&&<h3>{r.route}</h3>}<blockquote>“{r.text}”</blockquote>
   {Array.isArray(r.images)&&r.images.length>0&&<div className="v1ReviewShots">{r.images.slice(0,3).map((src,n)=><div className="v1ReviewShot" key={n}><img src={src} alt={`Traveler review photo ${n+1}`} loading="lazy"/></div>)}</div>}
   <footer><b>{r.name||"Traveler"}</b>{r.country&&<span>{r.country}</span>}</footer>
  </article>)}</div>}
  <p style={{marginTop:36}}>Ready to create your own China travel story? <Link href="/quote">Plan your journey →</Link></p>
 </main>;
}
