"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {createClient} from "../../utils/supabase/client";
type Review={id:string;context_type:string;context_slug:string;name:string;email:string;rating:number;body:string;status:string;admin_reply:string|null;created_at:string;featured_home:boolean;featured_reviews:boolean};
export default function ModerationManager(){
 const supabase=useMemo(()=>createClient(),[]);
 const [rows,setRows]=useState<Review[]>([]);const [message,setMessage]=useState("");const [loading,setLoading]=useState(true);
 const [filter,setFilter]=useState("all");const [drafts,setDrafts]=useState<Record<string,string>>({});const [busy,setBusy]=useState("");
 const refresh=useCallback(async()=>{setLoading(true);const {data,error}=await supabase.rpc("review_admin_list");setLoading(false);if(error){setMessage("无法加载新评论："+error.message);return;}setRows(data??[]);setMessage("");},[supabase]);
 useEffect(()=>{void refresh()},[refresh]);
 async function act(id:string,action:string){if(busy)return;if(action==="delete"&&!window.confirm("确定永久删除这条评论？此操作不可撤销。"))return;setBusy(id);const {error}=await supabase.rpc("review_admin_update",{p_id:id,p_action:action,p_reply:action==="reply"?(drafts[id]??""):null});setBusy("");if(error){setMessage("操作失败："+error.message);return;}await refresh();}
 async function feature(id:string,location:"home"|"reviews",enabled:boolean){if(busy)return;setBusy(id);const {error}=await supabase.rpc("review_admin_feature",{p_id:id,p_location:location,p_enabled:enabled});setBusy("");if(error){setMessage("精选设置失败："+error.message);return;}await refresh();}
 const visible=rows.filter(r=>filter==="all"||r.status===filter);
 return <section className="adminPanel"><header><div><h2>游客提交评论审核</h2><p>新提交的评论默认待审核。审核通过后会在相应线路、目的地和评论汇总页公开；邮箱仅管理员可见。</p></div><button className="adminPrimary" onClick={()=>void refresh()}>刷新评论</button></header>
 <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>{[["all","全部"],["pending","待审核"],["approved","已公开"],["hidden","已隐藏"]].map(([k,v])=><button type="button" key={k} onClick={()=>setFilter(k)} aria-pressed={filter===k} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #ccd7e2",background:filter===k?"#dbeafe":"white"}}>{v} ({k==="all"?rows.length:rows.filter(r=>r.status===k).length})</button>)}</div>
 {message&&<p role="alert" className="tourSuccess">{message}</p>}
 {loading?<p>正在加载评论…</p>:visible.length===0?<p>当前分类暂无评论。</p>:visible.map(r=><article className="destinationCard" key={r.id} style={{marginBottom:18,padding:20}}>
 <div className="destinationCardTitle"><b>{r.name} · {"★".repeat(r.rating)} · {r.status==="pending"?"待审核":r.status==="approved"?"已公开":"已隐藏"}</b><span>{new Date(r.created_at).toLocaleString("zh-CN")}</span></div>
 <p><b>来源：</b>{r.context_type==="tour"?"线路":r.context_type==="destination"?"目的地":"全站评论"} · {r.context_slug}</p><p><b>邮箱（不公开）：</b>{r.email}</p>
 <p style={{whiteSpace:"pre-wrap"}}>{r.body}</p>
 <label style={{display:"grid",gap:6}}><span>官方回复（公开显示）</span><textarea rows={3} maxLength={2000} value={drafts[r.id]??r.admin_reply??""} onChange={e=>setDrafts(s=>({...s,[r.id]:e.target.value}))}/></label>
 <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:14}}>
 <button disabled={!!busy||r.status!=="approved"&&!r.featured_home} onClick={()=>void feature(r.id,"home",!r.featured_home)}>{r.featured_home?"取消首页精选":"设为首页精选"}</button>
 <button disabled={!!busy||r.status!=="approved"&&!r.featured_reviews} onClick={()=>void feature(r.id,"reviews",!r.featured_reviews)}>{r.featured_reviews?"取消 Reviews 置顶":"置顶 Reviews"}</button>
 <button disabled={!!busy} onClick={()=>void act(r.id,"approved")} className="adminPrimary">审核通过</button>
 <button disabled={!!busy} onClick={()=>void act(r.id,"hidden")}>隐藏</button>
 <button disabled={!!busy} onClick={()=>void act(r.id,"pending")}>设为待审核</button>
 <button disabled={!!busy} onClick={()=>void act(r.id,"reply")}>保存回复</button>
 <button disabled={!!busy} className="danger" onClick={()=>void act(r.id,"delete")}>删除</button>
 </div></article>)}</section>;
}
