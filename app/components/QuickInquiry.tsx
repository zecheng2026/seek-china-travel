"use client";
import { FormEvent, useState } from "react";
import { createClient } from "../../utils/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

export default function QuickInquiry({ contextType, contextTitle, supabase }: { contextType: "Destination" | "Travel Guide"; contextTitle: string; supabase: SupabaseClient }) {
 const [adults,setAdults]=useState(2),[children,setChildren]=useState(0);
 const [sending,setSending]=useState(false),[result,setResult]=useState<"idle"|"success"|"error">("idle");
 const [startedAt]=useState(()=>Date.now());
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(sending)return;
  const form=e.currentTarget,fd=new FormData(form),get=(key:string)=>String(fd.get(key)??"").trim();
  if(get("website"))return;
  if(Date.now()-startedAt<2500||!get("phone")||!get("country")){setResult("error");return;}
  const normalizedPhone=get("phone").replace(/[\s().-]/g,"");
  if(!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)){setResult("error");return;}
  if(get("email")&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("email"))){setResult("error");return;}
  setSending(true);setResult("idle");
  const context=contextType+": "+contextTitle;
  const {error}=await supabase.from("inquiries").insert({
   full_name:"Website inquiry",email:get("email")||null,phone:normalizedPhone,whatsapp:normalizedPhone,
   destination:context,
   message:[context,"Travelers: "+adults+" adults, "+children+" children","Country: "+get("country"),get("travel_dates")&&"Travel dates: "+get("travel_dates"),get("message")&&"Trip preferences: "+get("message")].filter(Boolean).join("\n\n"),
   source:"website",status:"new"
  });
  setSending(false);if(error){setResult("error");return;}setResult("success");form.reset();setAdults(2);setChildren(0);
 }
 return <div className="tourQuickInquiry"><h3>Quick Inquiry</h3><p>Tell us a little about your trip.</p>{result==="success"?<div className="tourQuickSuccess" role="status"><strong>Thank you for your inquiry!</strong><p>Our travel team will contact you using your email or phone number.</p><button type="button" onClick={()=>setResult("idle")}>Send another inquiry</button></div>:<form onSubmit={submit}><label className="quoteTrap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label>Email <small>(Optional)</small><input name="email" type="email" maxLength={254} placeholder="email@example.com"/></label><label>WhatsApp or Phone Number <span aria-hidden="true">*</span><input name="phone" type="tel" required autoComplete="tel" inputMode="tel" maxLength={80} placeholder="e.g. +44 7700 900123"/><small className="phoneCountryHint">Include your country calling code, starting with + (e.g., +65 8123 4567).</small></label><fieldset><legend>Travelers <span aria-hidden="true">*</span></legend><div className="tourQuickCounters"><div><span>Adults<small>Age 12 and over</small></span><button type="button" disabled={adults<=1} aria-label="Remove adult" onClick={()=>setAdults(v=>Math.max(1,v-1))}>−</button><b>{adults}</b><button type="button" aria-label="Add adult" onClick={()=>setAdults(v=>Math.min(50,v+1))}>+</button></div><div><span>Children<small>Age 2 to 11</small></span><button type="button" disabled={children<=0} aria-label="Remove child" onClick={()=>setChildren(v=>Math.max(0,v-1))}>−</button><b>{children}</b><button type="button" aria-label="Add child" onClick={()=>setChildren(v=>Math.min(50,v+1))}>+</button></div></div></fieldset><label>Country <span aria-hidden="true">*</span><input name="country" type="text" required maxLength={100} autoComplete="country-name" placeholder="e.g. United Kingdom"/></label><label>Travel Dates<input name="travel_dates" maxLength={120} placeholder="e.g. March 10–18, 2027"/></label><label>Travel Preferences <small>(Optional)</small><textarea name="message" rows={3} maxLength={3000} placeholder="Any special requests or preferences?"/></label><p className="tourQuickPrivacy">We only use your details to respond to your travel inquiry.</p>{result==="error"&&<p className="quoteError" role="alert">Please enter your country and a valid WhatsApp number with country code (e.g. +44 7700 900123). If you provide an email, check that it is valid.</p>}<button className="tourQuickSubmit" type="submit" disabled={sending}>{sending?"Sending…":"Send My Inquiry →"}</button></form>}</div>
}
