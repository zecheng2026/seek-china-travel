"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import ReviewAvatar from "./ReviewAvatar";
import {submitReviewWithPhotos,reviewPhotoUrls} from "../../utils/reviewPhotos";
import SctReplyAvatar from "./SctReplyAvatar";
import {createClient} from "../../utils/supabase/client";
type Review={avatar_url?:string|null;images?:string[];id:string;name:string;rating:number;body:string;admin_reply:string|null;created_at:string};
export default function DetailReviews({type,slug}:{type:"tour"|"destination";slug:string}){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [error,setError]=useState("");
 const [expanded,setExpanded]=useState<Record<string,boolean>>({});
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [rating,setRating]=useState(0);const [body,setBody]=useState("");const [website,setWebsite]=useState("");const [photos,setPhotos]=useState<File[]>([]);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!slug)return;setBusy(true);setNotice("");try{await submitReviewWithPhotos(supabase,{p_context_type:type,p_context_slug:slug,p_name:name.trim(),p_email:email.trim(),p_rating:rating,p_body:body.trim(),p_website:website},photos);}catch(err){setBusy(false);setNotice(err instanceof Error?err.message:"Unable to submit your review.");return;}setBusy(false);setPhotos([]);setNotice("Thank you! Your review has been submitted for moderation.");setName("");setEmail("");setBody("");setRating(0);}

 useEffect(()=>{if(!slug)return;let active=true;supabase.from("traveler_reviews").select("id,name,rating,body,admin_reply,created_at,avatar_url,images").eq("context_type",type).eq("context_slug",slug).eq("status","approved").order("created_at",{ascending:false}).then(({data,error})=>{if(!active)return;if(error)setError("Reviews are temporarily unavailable.");else setReviews(data??[])});return()=>{active=false}},[slug,type,supabase]);
 return <section className="journeySection" style={{maxWidth:1100,margin:"40px auto",padding:"24px 20px",borderTop:"1px solid #e2e8f0"}}>
 <p className="journeysKicker">TRAVELER EXPERIENCES</p><h2>Traveler Reviews</h2>
 {error?<p>{error}</p>:reviews.length===0?<p>Be the first to share your experience.</p>:<div className="sctDetailReviewList">{reviews.map(r=>{const isExpanded=!!expanded[r.id];const long=r.body.length>240||r.body.split("\n").length>4;return <article key={r.id} className="sctDetailReviewCard">
 <div className="sctDetailReviewHead"><ReviewAvatar name={r.name} url={r.avatar_url}/><div className="sctDetailReviewAuthor"><strong>{r.name}</strong><span>{type==="tour"?"Verified tour review":"Destination experience"}</span></div><span className="sctDetailReviewStars" aria-label={r.rating+" out of 5 stars"}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span></div>
 <div className={"sctDetailReviewBody"+(!isExpanded&&long?" isCollapsed":"")}><p>{r.body}</p></div>
 {long&&<button type="button" className="sctDetailReviewToggle" aria-expanded={isExpanded} onClick={()=>setExpanded(v=>({...v,[r.id]:!v[r.id]}))}>{isExpanded?"Show less ↑":"Read full review →"}</button>}
 {Array.isArray(r.images)&&r.images.length>0&&<div className="sctReviewsImages">{reviewPhotoUrls(r.images,process.env.NEXT_PUBLIC_SUPABASE_URL||"").map((src,i)=><a key={i} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={"Traveler photo "+(i+1)} loading="lazy" style={{width:110,height:90,objectFit:"cover",borderRadius:8}}/></a>)}</div>}{r.admin_reply&&<div className="sctDetailReviewReply"><div className="sctDetailReviewReplyHead"><SctReplyAvatar/><strong>Response from SCT</strong></div><p>{r.admin_reply}</p></div>}
 </article>})}</div>}
 <div className="sctReviewFormCard">
  <h3>Leave a Review</h3>
  <p className="sctReviewHelp">Have you traveled with us? Share your experience below.</p>
  <form onSubmit={submit} className="sctReviewForm">
   <label className="sctReviewSrOnly" htmlFor="review-name">Your name</label><input id="review-name" required maxLength={100} placeholder="Your name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/>
   <label className="sctReviewSrOnly" htmlFor="review-email">Your email (not published)</label><input id="review-email" type="email" required maxLength={254} placeholder="Your email (not published)" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>
   <fieldset className="sctReviewRating"><legend>Your rating</legend><div className="sctReviewStars" role="group" aria-label="Your rating">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+" star"+(n>1?"s":"")} aria-pressed={rating===n} onClick={()=>setRating(n)} className={n<=rating?"selected":""}>★</button>)}</div></fieldset>
   <label className="sctReviewSrOnly" htmlFor="review-body">Your review</label><textarea id="review-body" required minLength={10} maxLength={3000} rows={4} placeholder="Share your travel experience..." value={body} onChange={e=>setBody(e.target.value)}/>
   <div className="sctReviewSrOnly" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
   <label>Add travel photos (up to 3)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{const selected=Array.from(e.target.files||[]);setPhotos(prev=>{const next=[...prev,...selected].slice(0,3);if(prev.length+selected.length>3)setNotice("You can add up to 3 photos.");else setNotice("");return next;});e.currentTarget.value="";}}/></label>{photos.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"8px 0"}}>{photos.map((f,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 10px",border:"1px solid #d9e2ea",borderRadius:8,fontSize:12}}>{f.name}<button type="button" aria-label={"Remove "+f.name} onClick={()=>setPhotos(v=>v.filter((_,n)=>n!==i))} style={{border:0,background:"transparent",cursor:"pointer",fontSize:16}}>×</button></span>)}</div>}
   <button type="submit" disabled={busy||!slug||rating===0} className="sctReviewSubmit">{busy?"Submitting…":"Submit Review →"}</button>
   <p className="sctReviewDisclaimer">Reviews are published after moderation.</p>{notice&&<p role="status" className="sctReviewNotice">{notice}</p>}
  </form>
 </div>
 <Link className="sctReviewsAllLink" href="/reviews">View All Reviews →</Link>
 </section>;
}
