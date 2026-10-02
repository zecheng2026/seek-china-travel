"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { createClient } from "../../utils/supabase/client";
export type HeroDefaults={eyebrow:string;title:string;subtitle:string;image:string;mobile_image?:string;image_position_x?:number;image_position_y?:number;mobile_position_x?:number;mobile_position_y?:number;overlay?:number;button_text?:string;button_link?:string};
type Row=Record<string,unknown>;
export default function ManagedHero({pageKey,defaults,className=""}:{pageKey:string;defaults:HeroDefaults;className?:string}){
 const supabase=useMemo(()=>createClient(),[]);const [hero,setHero]=useState<HeroDefaults>(defaults);const [ratio,setRatio]=useState("16/6");
 useEffect(()=>{void supabase.from("homepage_sections").select("*").eq("section_key","hero:"+pageKey).maybeSingle().then(({data})=>{const r=data as Row|null;if(!r)return;let cfg:Row={};try{cfg=typeof r.content==="string"?JSON.parse(r.content):((r.content as Row)??{});}catch{}setHero({...defaults,...cfg,image:String(cfg.image??r.image_url??defaults.image)});});},[supabase,pageKey,defaults]);
 useEffect(()=>{if(!hero.image||pageKey==="home")return;const img=new Image();img.onload=()=>{if(img.naturalWidth&&img.naturalHeight)setRatio(`${img.naturalWidth}/${img.naturalHeight}`)};img.src=hero.image;},[hero.image,pageKey]);
 const opacity=Math.max(0,Math.min(90,Number(hero.overlay??45)))/100;
 if(pageKey==="home")return <section className={"managedHero "+className} style={{backgroundImage:`url('${hero.image}')`,backgroundPosition:`${Number(hero.image_position_x??50)}% ${Number(hero.image_position_y??50)}%`,"--home-mobile-hero":`url('${hero.mobile_image||hero.image}')`,"--home-mobile-position":`${Number(hero.mobile_position_x??50)}% ${Number(hero.mobile_position_y??0)}%`} as React.CSSProperties}>{hero.button_text&&hero.button_link&&<Link className="btn homeHeroImageButton" href={hero.button_link}>{hero.button_text} →</Link>}</section>;
 return <section className={"managedHero "+className} style={{backgroundImage:`url('${hero.image}')`,backgroundPosition:`${Number((hero as Row).image_position_x??50)}% ${Number((hero as Row).image_position_y??50)}%`,"--hero-aspect":ratio} as React.CSSProperties}><div className="managedHeroShade" style={{background:`linear-gradient(90deg,rgba(4,31,52,${opacity}) 0%,rgba(4,31,52,${opacity*.65}) 48%,rgba(4,31,52,${opacity*.12}) 78%,rgba(4,31,52,0) 100%)`}}/><div className="managedHeroContent"><p className="managedHeroEyebrow">{hero.eyebrow}</p><h1>{hero.title}</h1><p>{hero.subtitle}</p>{hero.button_text&&hero.button_link&&<Link className="btn" href={hero.button_link}>{hero.button_text} →</Link>}</div></section>;
}
