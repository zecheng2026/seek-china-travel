"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import ManagedHero from "../components/ManagedHero";
import {createClient} from "../../utils/supabase/client";

const reviewsHeroDefaults={eyebrow:"SEEK CHINA TRAVEL",title:"Traveler Reviews",subtitle:"Real journeys, real stories. Discover what travelers say about exploring China with SCT.",image:"/images/china-hero.jpg",overlay:48,button_text:"",button_link:""};
type DisplayReview={id:string;name:string;country:string;route:string;text:string;rating:number;images:string[];category:"tour"|"destination"|"general";reply?:string};
type Review={id?:string|number;name?:string;country?:string;route?:string;text?:string;rating?:number;images?:string[];published?:boolean};
export default function ReviewsPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [reviews,setReviews]=useState<Review[]>([]);
 const [loading,setLoading]=useState(true);
 const [filter,setFilter]=useState("all");const [page,setPage]=useState(1);const [selected,setSelected]=useState<DisplayReview|null>(null);
 const [submittedReviews,setSubmittedReviews]=useState<{id:string;name:string;rating:number;body:string;context_type:string;context_slug:string;admin_reply:string|null}[]>([]);
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [rating,setRating]=useState(0);const [body,setBody]=useState("");const [website,setWebsite]=useState("");const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 const allReviews:DisplayReview[]=[...reviews.map((r,i)=>({id:"legacy-"+String(r.id??i),name:r.name||"Traveler",country:r.country||"",route:r.route||"",text:r.text||"",rating:Number(r.rating)||0,images:Array.isArray(r.images)?r.images:[],category:"general" as const})),...submittedReviews.map(r=>({id:"submitted-"+r.id,name:r.name,country:"",route:r.context_type==="general"?"":r.context_slug,text:r.body,rating:r.rating,images:[],category:(r.context_type==="tour"?"tour":r.context_type==="destination"?"destination":"general") as "tour"|"destination"|"general",reply:r.admin_reply||undefined}))];
 const filtered=allReviews.filter(r=>filter==="all"||r.category===filter);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy||!rating)return;setBusy(true);setNotice("");const {error}=await supabase.rpc("submit_traveler_review",{p_context_type:"general",p_context_slug:"all",p_name:name.trim(),p_email:email.trim(),p_rating:rating,p_body:body.trim(),p_website:website});setBusy(false);if(error){setNotice("Unable to submit your review right now. Please try again later.");return;}setNotice("Thank you! Your review has been submitted for moderation.");setName("");setEmail("");setBody("");setRating(0);}

 useEffect(()=>{let active=true;supabase.from("traveler_reviews").select("id,name,rating,body,context_type,context_slug,admin_reply").eq("status","approved").order("created_at",{ascending:false}).limit(100).then(({data})=>{if(active)setSubmittedReviews(data??[])});return()=>{active=false}},[supabase]);
 useEffect(()=>{let alive=true;supabase.from("homepage_sections").select("content").eq("section_key","home:reviews").maybeSingle().then(({data})=>{
  if(!alive)return;
  try{const value=typeof data?.content==="string"?JSON.parse(data.content):data?.content;setReviews(Array.isArray(value?.reviews)?value.reviews.filter((r:Review)=>r?.published!==false&&String(r?.text??"").trim()):[])}catch{setReviews([])}
  setLoading(false);
 });return()=>{alive=false}},[supabase]);
 return <main style={{maxWidth:1100,margin:"0 auto",padding:"clamp(90px,12vw,150px) 20px 80px"}}>
  <p className="v1Eyebrow red">SEEK CHINA TRAVEL</p><h1>Traveler Reviews</h1>
  <p>Real journeys, real stories. Discover what travelers say about exploring China with SCT.</p>
  <div className="sctReviewsFilters" role="group" aria-label="Filter reviews">{[["all","All Reviews"],["tour","Tour Reviews"],["destination","Destination Reviews"]].map(([key,label])=><button key={key} type="button" className={filter===key?"active":""} aria-pressed={filter===key} onClick={()=>{setFilter(key);setPage(1)}}>{label}</button>)}</div>
  {loading?<p>Loading reviews…</p>:filtered.length===0?<p>There are no published reviews in this category yet.</p>:
  <div className="sctReviewsGrid">{filtered.slice((page-1)*9,page*9).map(r=><article className="sctReviewsCard" key={r.id}>
    <div className="sctReviewsCardTop"><span>{r.category==="tour"?"TOUR REVIEW":r.category==="destination"?"DESTINATION REVIEW":"TRAVELER STORY"}</span>{r.rating>0&&<span className="sctReviewsStars" aria-label={r.rating+" out of 5 stars"}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>}</div>
    {r.route&&<h3>{r.route}</h3>}
    <p className="sctReviewsExcerpt">{r.text}</p>
    {r.text.length>155&&<button className="sctReviewsReadMore" onClick={()=>setSelected(r)} type="button">Read More →</button>}
    {r.images.length>0&&<div className="sctReviewsImages">{r.images.slice(0,3).map((src,i)=><img src={src} alt={"Traveler photo "+(i+1)} loading="lazy" key={i}/>)}</div>}
    <footer><strong>{r.name}</strong>{r.country&&<small>{r.country}</small>}</footer>
  </article>)}</div>}
  {filtered.length>9&&<nav className="sctReviewsPagination" aria-label="Review pages"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Previous</button><span>Page {page} of {Math.ceil(filtered.length/9)}</span><button disabled={page>=Math.ceil(filtered.length/9)} onClick={()=>setPage(p=>p+1)}>Next →</button></nav>}
  {selected&&<div className="sctReviewsOverlay" role="presentation" onClick={()=>setSelected(null)}><section className="sctReviewsDialog" role="dialog" aria-modal="true" aria-label="Full traveler review" onClick={e=>e.stopPropagation()}><button className="sctReviewsClose" onClick={()=>setSelected(null)} aria-label="Close full review">×</button><h2>{selected.route||"Traveler Review"}</h2>{selected.rating>0&&<p className="sctReviewsStars">{"★".repeat(selected.rating)}</p>}<p style={{whiteSpace:"pre-wrap"}}>{selected.text}</p>{selected.images.length>0&&<div className="sctReviewsImages">{selected.images.map((src,i)=><img src={src} alt={"Traveler photo "+(i+1)} key={i}/>)}</div>}<p><strong>{selected.name}</strong>{selected.country&&" · "+selected.country}</p>{selected.reply&&<p><strong>Response from SCT:</strong> {selected.reply}</p>}</section></div>}
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
 </main></>;

}
