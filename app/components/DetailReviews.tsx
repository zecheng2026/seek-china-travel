"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {createClient} from "../../utils/supabase/client";
type Review={id:string;name:string;rating:number;body:string;admin_reply:string|null;created_at:string};
export default function DetailReviews({type,slug}:{type:"tour"|"destination";slug:string}){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [error,setError]=useState("");
 useEffect(()=>{if(!slug)return;let active=true;supabase.from("traveler_reviews").select("id,name,rating,body,admin_reply,created_at").eq("context_type",type).eq("context_slug",slug).eq("status","approved").order("created_at",{ascending:false}).then(({data,error})=>{if(!active)return;if(error)setError("Reviews are temporarily unavailable.");else setReviews(data??[])});return()=>{active=false}},[slug,type,supabase]);
 return <section className="journeySection" style={{maxWidth:1100,margin:"40px auto",padding:"24px 20px",borderTop:"1px solid #e2e8f0"}}>
 <p className="journeysKicker">TRAVELER EXPERIENCES</p><h2>Traveler Reviews</h2>
 {error?<p>{error}</p>:reviews.length===0?<p>No reviews have been published for this {type} yet.</p>:<div style={{display:"grid",gap:18,marginTop:24}}>{reviews.map(r=><article key={r.id} style={{padding:20,border:"1px solid #e2e8f0",borderRadius:12}}>
 <strong>{r.name}</strong><p aria-label={r.rating+" out of 5 stars"} style={{color:"#c88b20",margin:"6px 0"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</p>
 <p style={{whiteSpace:"pre-wrap"}}>{r.body}</p>{r.admin_reply&&<div style={{padding:12,background:"#f1f5f9",borderRadius:8}}><strong>Response from SCT</strong><p>{r.admin_reply}</p></div>}
 </article>)}</div>}
 <p style={{marginTop:24}}>Have you traveled with us? We would love to hear about your experience. <Link href="/contact">Contact our team →</Link></p>
 <Link href="/reviews">View All Reviews →</Link>
 </section>;
}
