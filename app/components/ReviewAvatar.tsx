"use client";
export default function ReviewAvatar({name,url,size=46}:{name:string;url?:string|null;size?:number}){
 const initials=(name.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join("")||"T").toUpperCase();
 return <span aria-label={name+" avatar"} style={{width:size,height:size,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",background:"#e8f0fa",color:"#123c68",fontWeight:700,fontSize:size*.35,border:"1px solid #dce6f2"}}>
 {url?<img src={url} alt={name} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement?.setAttribute("data-fallback",initials)}}/>:initials}
 </span>;
}
