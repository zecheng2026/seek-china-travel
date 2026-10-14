"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { createClient } from "../../utils/supabase/client";
export type HeroDefaults={eyebrow:string;title:string;subtitle:string;image:string;mobile_image?:string;image_position_x?:number;image_position_y?:number;mobile_position_x?:number;mobile_position_y?:number;overlay?:number;text_position_x?:string;text_position_y?:string;mobile_text_position_x?:string;mobile_text_position_y?:string;button_text?:string;button_link?:string};
type Row=Record<string,unknown>;
export default function ManagedHero({pageKey,defaults,className=""}:{pageKey:string;defaults:HeroDefaults;className?:string}){
 const supabase=useMemo(()=>createClient(),[]);const [hero,setHero]=useState<HeroDefaults>(defaults);const [ratio,setRatio]=useState("16/6");
 useEffect(()=>{
  let cancelled=false;
  const cacheKey="sct-hero-cache:"+pageKey;
  if(pageKey==="home"){
   try{
    const cached=JSON.parse(window.sessionStorage.getItem(cacheKey)||"null") as {time:number;hero:HeroDefaults}|null;
    if(cached&&Date.now()-cached.time<15*60*1000&&cached.hero?.image)setHero(cached.hero);
   }catch{}
  }
  void supabase.from("homepage_sections").select("content,image_url").eq("section_key","hero:"+pageKey).maybeSingle().then(({data})=>{
   if(cancelled||!data)return;
   const r=data as Row;let cfg:Row={};try{cfg=typeof r.content==="string"?JSON.parse(r.content):((r.content as Row)??{});}catch{}
   const next={...defaults,...cfg,image:String(cfg.image??r.image_url??defaults.image)};
   setHero(next);
   if(pageKey==="home"&&next.image){try{window.sessionStorage.setItem(cacheKey,JSON.stringify({time:Date.now(),hero:next}))}catch{}}
  });
  return()=>{cancelled=true};
 },[supabase,pageKey,defaults]);
 useEffect(()=>{if(!hero.image||pageKey==="home")return;const img=new Image();img.onload=()=>{if(img.naturalWidth&&img.naturalHeight)setRatio(`${img.naturalWidth}/${img.naturalHeight}`)};img.src=hero.image;},[hero.image,pageKey]);
 const opacity=Math.max(0,Math.min(90,Number(hero.overlay??45)))/100;
 if(pageKey==="home")return <section aria-label="China private tours" className={"managedHero "+className} style={{backgroundImage:"none",backgroundPosition:`${Number(hero.image_position_x??50)}% ${Number(hero.image_position_y??50)}%`,"--home-mobile-hero":"none","--home-mobile-position":`${Number(hero.mobile_position_x??50)}% ${Number(hero.mobile_position_y??0)}%`} as React.CSSProperties}>
  {hero.image&&<picture className="homeHeroPicture">
    {hero.mobile_image&&<source media="(max-width: 680px)" srcSet={hero.mobile_image}/>}
    <img className="homeHeroPhoto" src={hero.image} alt="Explore Real China with SEEK CHINA TRAVEL" fetchPriority="high" loading="eager" decoding="async" style={{objectPosition:`${Number(hero.image_position_x??50)}% ${Number(hero.image_position_y??50)}%`}}/>
  </picture>}
  {hero.button_text&&hero.button_link&&<Link className="btn homeHeroImageButton" href={hero.button_link}>{hero.button_text} →</Link>}
 </section>;
 return <section className={"managedHero "+className+(pageKey==="about"?" aboutTextPositionHero":"")} style={{...(pageKey==="about"?{"--about-text-x":(["left","center","right"].includes(String(hero.text_position_x))?hero.text_position_x:"left"),"--about-text-y":(["top","center","bottom"].includes(String(hero.text_position_y))?hero.text_position_y:"bottom"),"--about-mobile-text-x":(["left","center","right"].includes(String(hero.mobile_text_position_x))?hero.mobile_text_position_x:"left"),"--about-mobile-text-y":(["top","center","bottom"].includes(String(hero.mobile_text_position_y))?hero.mobile_text_position_y:"bottom")}:{}),backgroundImage:`url('${hero.image}')`,backgroundPosition:`${Number((hero as Row).image_position_x??50)}% ${Number((hero as Row).image_position_y??50)}%`,"--hero-aspect":ratio} as React.CSSProperties}><div className="managedHeroShade" style={{background:`linear-gradient(90deg,rgba(4,31,52,${opacity}) 0%,rgba(4,31,52,${opacity*.65}) 48%,rgba(4,31,52,${opacity*.12}) 78%,rgba(4,31,52,0) 100%)`}}/><div className="managedHeroContent"><p className="managedHeroEyebrow">{hero.eyebrow}</p><h1>{hero.title}</h1><p>{hero.subtitle}</p>{hero.button_text&&hero.button_link&&<Link className="btn" href={hero.button_link}>{hero.button_text} →</Link>}</div></section>;
}
