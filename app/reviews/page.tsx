"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {createClient} from "../../utils/supabase/client";

type Review={id?:string|number;name?:string;country?:string;route?:string;text?:string;rating?:number;images?:string[];published?:boolean};
export default function ReviewsPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [loading,setLoading]=useState(true);
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [rating,setRating]=useState(0);const [body,setBody]=useState("");const [website,setWebsite]=useState("");const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!rating)return;setBusy(true);setNotice("");const {error}=await supabase.rpc("submit_traveler_review",{p_context_type:"general",p_context_slug:"all",p_name:name.trim(),p_email:email.trim(),p_rating:rating,p_body:body.trim(),p_website:website});setBusy(false);if(error){setNotice("Unable to submit your review right now. Please try again later.");return;}setNotice("Thank you! Your review has been submitted for moderation.");setName("");setEmail("");setBody("");setRating(0);}

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
  <section id="leave-review" className="sctReviewFormCard" style={{marginTop:44,scrollMarginTop:110}}>
   <h2>Leave a Review</h2><p className="sctReviewHelp">Have you traveled with SCT? Share your experience. Reviews are published after moderation.</p>
   <form className="sctReviewForm" onSubmit={submit}>
    <label className="sctReviewSrOnly" htmlFor="all-review-name">Your name</label><input id="all-review-name" required maxLength={100} placeholder="Your name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/>
    <label className="sctReviewSrOnly" htmlFor="all-review-email">Your email (not published)</label><input id="all-review-email" required type="email" maxLength={254} placeholder="Your email (not published)" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <fieldset className="sctReviewRating"><legend>Your rating</legend><div className="sctReviewStars" role="group" aria-label="Your rating">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+" star"+(n>1?"s":"")} aria-pressed={rating===n} onClick={()=>setRating(n)} className={n<=rating?"selected":""}>★</button>)}</div></fieldset>
    <label className="sctReviewSrOnly" htmlFor="all-review-body">Your review</label><textarea id="all-review-body" required minLength={10} maxLength={3000} rows={4} placeholder="Share your travel experience..." value={body} onChange={e=>setBody(e.target.value)}/>
    <div className="sctReviewSrOnly" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
    <button className="sctReviewSubmit" type="submit" disabled={busy||rating===0}>{busy?"Submitting…":"Submit Review →"}</button><p className="sctReviewDisclaimer">Reviews are published after moderation.</p>{notice&&<p role="status" className="sctReviewNotice">{notice}</p>}
   </form>
  </section>
  <p style={{marginTop:36}}>Ready to create your own China travel story? <Link href="/quote">Plan your journey →</Link></p>
 </main>;
}
