"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ManagedHero from "../components/ManagedHero";
import { createClient } from "../../utils/supabase/client";

export default function Quote(){
 const supabase=useMemo(()=>createClient(),[]);
 const [tour,setTour]=useState("");const [destination,setDestination]=useState("");const [sending,setSending]=useState(false);
 const [result,setResult]=useState<"idle"|"success"|"error">("idle");const [startedAt]=useState(()=>Date.now());
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setTour(params.get("tour")??"");setDestination(params.get("destination")??"");},[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(sending)return;
  const form=e.currentTarget;const fd=new FormData(form);
  const get=(key:string)=>String(fd.get(key)??"").trim();
  if(get("website"))return;
  if(Date.now()-startedAt<2500){setResult("error");return;}
  if(!get("name")||!get("email")||!get("message"))return;
  setSending(true);setResult("idle");
  const {error}=await supabase.from("inquiries").insert({
   full_name:get("name"),email:get("email"),phone:get("phone"),whatsapp:get("phone"),
   destination:[get("destinations"),get("tour_name")&&"Interested tour: "+get("tour_name")].filter(Boolean).join(" · "),
   message:[get("message"),get("travel_dates")&&"Travel dates: "+get("travel_dates"),get("travelers")&&"Travelers: "+get("travelers")].filter(Boolean).join("\\n\\n"),
   source:"website",status:"new"
  });
  setSending(false);
  if(error){setResult("error");return;}
  setResult("success");form.reset();
 }
 return <main><ManagedHero pageKey="quote" className="quoteHero" defaults={{eyebrow:"TAILOR-MADE CHINA",title:"Plan Your China Trip",subtitle:"Share your ideas with us and start building a China journey around you.",image:"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2200&q=86",overlay:52}}/>
 <section className="formWrap"><div className="quoteIntro"><p className="journeysKicker">YOUR JOURNEY STARTS HERE</p><h2>Tell us about your trip</h2><p>Share a few details and our China travel team can prepare a personalized itinerary.</p></div>
 {result==="success"?<div className="quoteSuccess" role="status"><h2>Thank you for your inquiry!</h2><p>We've received your trip details. Our team will be in touch using your contact information.</p><button type="button" className="btn" onClick={()=>setResult("idle")}>Plan another trip →</button></div>:
 <form className="quoteForm" onSubmit={submit}><label className="quoteTrap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
 <label>Your name *<input name="name" required maxLength={120} placeholder="Your full name"/></label>
 <label>Email *<input name="email" type="email" required maxLength={254} placeholder="you@example.com"/></label>
 <label>WhatsApp / Phone<input name="phone" maxLength={80} placeholder="+65 ..."/></label>
 <label>Travel dates<input name="travel_dates" maxLength={120} placeholder="e.g. March 10–18, 2027"/></label>
 <label>Travelers<select name="travelers" defaultValue="2 travelers"><option>1 traveler</option><option>2 travelers</option><option>3–5 travelers</option><option>6+ travelers</option></select></label>
 <label>Destinations<input name="destinations" value={destination} onChange={e=>setDestination(e.target.value)} maxLength={250} placeholder="Beijing, Xi'an, Zhangjiajie..."/></label>
 <label className="full">Interested tour<select name="tour_name" value={tour} onChange={e=>setTour(e.target.value)}><option value="">Please select</option><option value="Historical & Cultural">Historical & Cultural</option><option value="Natural Scenery">Natural Scenery</option><option value="Geological Wonders">Geological Wonders</option><option value="Folk & Ethnic Culture">Folk & Ethnic Culture</option><option value="Museum & Exhibition">Museum & Exhibition</option><option value="Theme & Amusement">Theme & Amusement</option><option value="Wellness Resort">Wellness Resort</option><option value="City Landmark">City Landmark</option><option value="Others">Others</option></select></label>
 <label className="full">What kind of trip are you imagining? *<textarea name="message" rows={5} required maxLength={5000} placeholder="Tell us about your interests, hotel preference, pace, special needs or anything else."/></label>
 <p className="quotePrivacy full">We use your details only to respond to your travel inquiry. Please do not include passport numbers or payment information.</p>
 {result==="error"&&<p className="quoteError full" role="alert">Your request could not be sent. Please try again later.</p>}
 <button type="submit" className="btn full quoteSubmit" disabled={sending}>{sending?"Sending your inquiry…":"Request My Trip Plan →"}</button>
 </form>}</section></main>;
}
