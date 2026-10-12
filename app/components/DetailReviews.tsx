"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {createClient} from "../../utils/supabase/client";
type Review={id:string;name:string;rating:number;body:string;admin_reply:string|null;created_at:string};
export default function DetailReviews({type,slug}:{type:"tour"|"destination";slug:string}){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [error,setError]=useState("");
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [rating,setRating]=useState(5);const [body,setBody]=useState("");const [website,setWebsite]=useState("");const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!slug)return;setBusy(true);setNotice("");const {error}=await supabase.rpc("submit_traveler_review",{p_context_type:type,p_context_slug:slug,p_name:name.trim(),p_email:email.trim(),p_rating:rating,p_body:body.trim(),p_website:website});setBusy(false);if(error){setNotice("Unable to submit your review right now. Please try again later.");return;}setNotice("Thank you! Your review has been submitted for moderation.");setName("");setEmail("");setBody("");setRating(5);}

 useEffect(()=>{if(!slug)return;let active=true;supabase.from("traveler_reviews").select("id,name,rating,body,admin_reply,created_at").eq("context_type",type).eq("context_slug",slug).eq("status","approved").order("created_at",{ascending:false}).then(({data,error})=>{if(!active)return;if(error)setError("Reviews are temporarily unavailable.");else setReviews(data??[])});return()=>{active=false}},[slug,type,supabase]);
 return <section className="journeySection" style={{maxWidth:1100,margin:"40px auto",padding:"24px 20px",borderTop:"1px solid #e2e8f0"}}>
 <p className="journeysKicker">TRAVELER EXPERIENCES</p><h2>Traveler Reviews</h2>
 {error?<p>{error}</p>:reviews.length===0?<p>Be the first to share your experience.</p>:<div style={{display:"grid",gap:18,marginTop:24}}>{reviews.map(r=><article key={r.id} style={{padding:20,border:"1px solid #e2e8f0",borderRadius:12}}>
 <strong>{r.name}</strong><p aria-label={r.rating+" out of 5 stars"} style={{color:"#c88b20",margin:"6px 0"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</p>
 <p style={{whiteSpace:"pre-wrap"}}>{r.body}</p>{r.admin_reply&&<div style={{padding:12,background:"#f1f5f9",borderRadius:8}}><strong>Response from SCT</strong><p>{r.admin_reply}</p></div>}
 </article>)}</div>}
 <form onSubmit={submit} style={{display:"grid",gap:14,maxWidth:650,marginTop:32}}><h3>Leave a Review</h3><p>Have you traveled with us? Share your experience below. Reviews are published after moderation.</p><label>Your name<input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6}}/></label><label>Email (not published)<input type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6}}/></label><label>Your rating<select value={rating} onChange={e=>setRating(Number(e.target.value))} style={{display:"block",padding:12,marginTop:6}}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} star{n>1?"s":""}</option>)}</select></label><label>Your review<textarea required minLength={10} maxLength={3000} rows={5} value={body} onChange={e=>setBody(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:6}}/></label><div style={{position:"absolute",left:"-9999px"}} aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div><button type="submit" disabled={busy||!slug} className="btn" style={{justifySelf:"start",cursor:"pointer"}}>{busy?"Submitting…":"Submit Review →"}</button>{notice&&<p role="status">{notice}</p>}</form>
 <Link href="/reviews">View All Reviews →</Link>
 </section>;
}
