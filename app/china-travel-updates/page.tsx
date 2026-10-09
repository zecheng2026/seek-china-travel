"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "../../utils/supabase/client";


type News={id:string;title:string;slug:string;updated_at:string;created_at:string};
export default function ChinaTravelUpdatesPreview(){
 const supabase=useMemo(()=>createClient(),[]);
 const [articles,setArticles]=useState<News[]>([]);
 const [loading,setLoading]=useState(true);
 const [page,setPage]=useState(1);
 useEffect(()=>{supabase.from("travel_guides").select("id,title,slug,updated_at,created_at").eq("category","China Travel Updates").eq("is_published",true).then(({data})=>{setArticles((data??[]) as News[]);setLoading(false);});},[supabase]);
 const sorted=[...articles].sort((a,b)=>Date.parse(b.updated_at||b.created_at)-Date.parse(a.updated_at||a.created_at));
 const pageCount=Math.ceil(sorted.length/10);
 const paged=sorted.slice((page-1)*10,page*10);
 function changePage(n:number){setPage(n);document.querySelector(".ctuList")?.scrollIntoView({behavior:"smooth",block:"start"});}
 return <main className="ctu">
 <section className="newsIndexHeader"><div className="ctuWrap"><Link href="/travel-guide" className="newsBack">← Travel Guide</Link><p className="ctuEyebrow">STAY INFORMED</p><h1>China Travel Updates</h1><p className="newsIndexDescription">Latest travel news and important updates for international visitors to China.</p></div></section>
 <section className="ctuWrap newsIndexBody">
 <div className="ctuList">{loading?<p>Loading travel updates…</p>:paged.length===0?<p>No travel updates published yet.</p>:paged.map(a=><Link href={"/travel-guide/"+encodeURIComponent(a.slug)} className="ctuListItem" key={a.id}><div className="ctuListDate"><strong>{new Date(a.updated_at||a.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</strong><span>{new Date(a.updated_at||a.created_at).getFullYear()}</span></div><div className="ctuListCopy"><h3>{a.title}</h3></div><span className="ctuArrow" aria-hidden="true">→</span></Link>)}</div>{pageCount>1&&<nav className="sitePagination" aria-label="News pagination"><button disabled={page===1} onClick={()=>changePage(page-1)}>Previous</button>{Array.from({length:pageCount},(_,i)=>i+1).map(n=><button key={n} className={n===page?"active":""} onClick={()=>changePage(n)}>{n}</button>)}<button disabled={page===pageCount} onClick={()=>changePage(page+1)}>Next</button></nav>}
 <section className="ctuFoot"><div><p className="ctuEyebrow">PLAN WITH CONFIDENCE</p><h2>Ready to explore China?</h2><p>Discover private, tailor-made journeys designed around your travel style.</p></div><Link href="/tours">Explore China Tours →</Link></section>
 </section>
 <style jsx>{`
 .ctu{background:#fff;color:#103b59;min-height:100vh;font-family:Arial,Helvetica,sans-serif}.ctuWrap{max-width:1120px;margin:0 auto;padding:0 24px}.newsIndexHeader{background:#EDF3F7;padding:44px 0 36px;border-bottom:1px solid #dfe7ed}.newsBack{display:inline-block;color:#57758a;font-size:13px;text-decoration:none;margin-bottom:55px}.ctuEyebrow{color:#dc353d;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 14px}.newsIndexHeader h1{font-size:clamp(34px,4.5vw,52px);line-height:1.16;letter-spacing:-1.4px;margin:0 0 14px}.newsIndexDescription{font-size:15px;line-height:1.7;color:#65798a;max-width:700px;margin:0}.newsIndexBody{padding-bottom:80px}.ctuList{border-top:1px solid #dfe7ed}.ctuListItem{display:grid;grid-template-columns:125px minmax(0,1fr) 28px;align-items:center;gap:20px;padding:24px 0;border-bottom:1px solid #e4e9ee;text-decoration:none;color:#103b59}.ctuListItem:hover h3{color:#d83b42}.ctuListDate{display:flex;flex-direction:column;gap:3px;color:#637d8e}.ctuListDate strong{font-size:15px;font-weight:600}.ctuListDate span{font-size:12px}.ctuListCopy{min-width:0}.ctuListCopy h3{font-size:19px;line-height:1.45;margin:0;font-weight:600}.ctuArrow{justify-self:end;color:#c43b44;font-size:21px}.sitePagination{display:flex;justify-content:center;gap:9px;margin:30px 0}.sitePagination button{border:1px solid #dfe7ed;background:#fff;color:#103b59;border-radius:6px;padding:9px 13px;cursor:pointer}.sitePagination button.active{background:#103b59;color:#fff}.sitePagination button:disabled{opacity:.4;cursor:default}.ctuFoot{margin-top:70px;background:#f3f7f9;border-radius:12px;padding:35px;display:flex;align-items:center;justify-content:space-between;gap:20px}.ctuFoot h2{margin:0;font-size:28px}.ctuFoot p:not(.ctuEyebrow){color:#637d8e;font-size:13px}.ctuFoot a{background:#103a59;color:white;padding:14px 20px;border-radius:6px;text-decoration:none;white-space:nowrap;font-size:13px}@media(max-width:650px){.ctuWrap{padding:0 16px}.newsIndexHeader{padding-top:25px}.newsBack{margin-bottom:35px}.ctuListItem{grid-template-columns:73px minmax(0,1fr) 18px;gap:9px;padding:18px 0}.ctuListDate strong{font-size:12px}.ctuListDate span{font-size:11px}.ctuListCopy h3{font-size:14px}.ctuArrow{font-size:17px}.ctuFoot{flex-direction:column;align-items:flex-start;padding:24px}.ctuFoot h2{font-size:23px}}
 `}</style>
 </main>;
}
