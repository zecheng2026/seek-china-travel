"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "../../utils/supabase/client";
export default function SctReplyAvatar(){
 const supabase=useMemo(()=>createClient(),[]);
 const [url,setUrl]=useState("");
 useEffect(()=>{let active=true;supabase.from("homepage_sections").select("content").eq("section_key","site:chrome").maybeSingle().then(({data})=>{if(!active)return;try{const c=typeof data?.content==="string"?JSON.parse(data.content):data?.content;setUrl(typeof c?.reviewReplyAvatarUrl==="string"?c.reviewReplyAvatarUrl:"");}catch{}});return()=>{active=false}},[supabase]);
 return <span aria-label="SEEK CHINA TRAVEL" style={{width:36,height:36,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,background:"#fff",border:"1px solid #dbe7f3",fontWeight:800,fontSize:11,color:"#143e68"}}>{url?<img src={url} alt="SCT logo" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setUrl("")}/>: "SCT"}</span>;
}
