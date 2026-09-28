"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { createClient } from "../../utils/supabase/client";
export type HeroDefaults={eyebrow:string;title:string;subtitle:string;image:string;overlay?:number;button_text?:string;button_link?:string};
type Row=Record<string,unknown>;
export default function ManagedHero({pageKey,defaults,className=""}:{pageKey:string;defaults:HeroDefaults;className?:string}){
 const supabase=useMemo(()=>createClient(),[]);const [hero,setHero]=useState<HeroDefaults>(defaults);const [heroReady,setHeroReady]=useState(false);const [ratio,setRatio]=useState("16/6");
 useEffect(()=>{let active=true;setHeroReady(false);supabase.from("homepage_sections").select("*").eq("section_key","hero:"+pageKey).maybeSingle().then(({data})=>{if(!active)return;const r=data as Row|null;if(r){let cfg:Row={};try{cfg=typeof r.content==="string"?JSON.parse(r.content):((r.content as Row)??{});}catch{}setHero({...defaults,...cfg,image:String(cfg.image??r.image_url??defaults.image)});}setHeroReady(true);}).catch(()=>{if(active)setHeroReady(true)});return()=>{active=false};},[supabase,pageKey]);
 useEffect(()=>{if(!hero.image||pageKey==="home")return;const img=new Image();img.onload=()=>{if(img.naturalWidth&&img.naturalHeight)setRatio(`${img.naturalWidth}/${img.naturalHeight}`)};img.src=hero.image;},[hero.image,pageKey]);
 const opacity=Math.max(0,Math.min(90,Number(hero.overlay??45)))/100;
 if(pageKey==="home")return <section className={"managedHero "+className+(heroReady?" heroReady":"")} style={{backgroundImage:heroReady?`url('${hero.image}')`:"none"}}>{hero.button_text&&hero.button_link&&<Link className="btn homeHeroImageButton" href={hero.button_link}>{hero.button_text} →</Link>}</section>;
 return <section className={"managedHero "+className} style={{backgroundImage:`url('${hero.image}')`,"--hero-aspect":ratio} as React.CSSProperties}><div className="managedHeroShade" style={{background:`linear-gradient(90deg,rgba(4,31,52,${opacity}) 0%,rgba(4,31,52,${opacity*.65}) 48%,rgba(4,31,52,${opacity*.12}) 78%,rgba(4,31,52,0) 100%)`}}/><div className="managedHeroContent"><p className="managedHeroEyebrow">{hero.eyebrow}</p><h1>{hero.title}</h1><p>{hero.subtitle}</p>{hero.button_text&&hero.button_link&&<Link className="btn" href={hero.button_link}>{hero.button_text} →</Link>}</div></section>;
}
