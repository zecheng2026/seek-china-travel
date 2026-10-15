"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {createClient} from "../../utils/supabase/client";

type Kind="inquiries"|"bookings"|"reviews";
type Alert={kind:Kind;id:string;created_at:string};
const kinds:[Kind,string][]=[["inquiries","新客户咨询"],["bookings","新订单"],["reviews","新游客留言"]];
const POLL_MS=30000;
export default function AdminNotifications({userId,onNavigate}:{userId:string;onNavigate:(key:"inquiries"|"bookings"|"reviews")=>void}){
 const supabase=useMemo(()=>createClient(),[]);
 const [alerts,setAlerts]=useState<Alert[]>([]);
 const [newInquiryCount,setNewInquiryCount]=useState(0);
 const [open,setOpen]=useState(false);
 const [sound,setSound]=useState(false);
 const [error,setError]=useState("");
 const known=useRef<Record<Kind,Set<string>>>({inquiries:new Set(),bookings:new Set(),reviews:new Set()});
 const ready=useRef<Record<Kind,boolean>>({inquiries:false,bookings:false,reviews:false});
 const audio=useRef<AudioContext|null>(null);
 const rootRef=useRef<HTMLDivElement|null>(null);
 const soundKey="sct-admin-sound-"+userId;
 const soundRef=useRef(false);
 useEffect(()=>{soundRef.current=sound},[sound]);
 useEffect(()=>{try{setSound(window.localStorage.getItem(soundKey)==="on")}catch{}},[soundKey]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(rootRef.current&&!rootRef.current.contains(e.target as Node))setOpen(false)};const escape=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)}},[open]);
 useEffect(()=>{
  let alive=true;let busy=false;
  const play=()=>{if(!soundRef.current)return;try{const ctx=audio.current;if(!ctx||ctx.state!=="running")return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.value=740;gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)}catch{}};
  const check=async()=>{
   if(busy||document.visibilityState==="hidden")return;busy=true;
   try{
    const results=await Promise.all([
     supabase.from("inquiries").select("id,created_at,status").order("created_at",{ascending:false}).limit(50),
     supabase.from("bookings").select("id,created_at").order("created_at",{ascending:false}).limit(50),
     supabase.rpc("review_admin_list")
    ]);
    if(!alive)return;
    let additions:Alert[]=[];let failures:string[]=[];
    const pending=await supabase.from("inquiries").select("id",{count:"exact",head:true}).eq("status","new");
    if(!alive)return;
    if(pending.error)failures.push("新询盘数量");else setNewInquiryCount(pending.count??0);
    for(let i=0;i<3;i++){
     const kind=kinds[i][0],res=results[i];
     if(res.error){failures.push(kinds[i][1]);continue;}
     const list=(Array.isArray(res.data)?res.data:[]) as {id:unknown;created_at?:unknown;status?:unknown}[];
     const entries=list.filter(x=>x.id!=null).map(x=>({kind,id:String(x.id),created_at:String(x.created_at??""),status:String(x.status??"")}));
     if(!ready.current[kind]){known.current[kind]=new Set(entries.map(x=>x.id));ready.current[kind]=true;continue;}
     const fresh=entries.filter(x=>!known.current[kind].has(x.id)&&(kind!=="reviews"||x.status==="pending"));
     entries.forEach(x=>known.current[kind].add(x.id));
     additions.push(...fresh.filter(x=>x.kind!=="inquiries").map(({kind,id,created_at})=>({kind,id,created_at})));
    }
    setError(failures.length?"部分提醒暂不可用："+failures.join("、"):"");
    if(additions.length){setAlerts(prev=>[...additions,...prev].slice(0,30));play();}
   }finally{busy=false;}
  };
  void check();
  const timer=window.setInterval(()=>void check(),POLL_MS);
  const onVisible=()=>{if(document.visibilityState==="visible")void check()};
  document.addEventListener("visibilitychange",onVisible);
  return()=>{alive=false;window.clearInterval(timer);document.removeEventListener("visibilitychange",onVisible)};
 },[supabase,userId]);
 useEffect(()=>()=>{if(audio.current)void audio.current.close()},[]);
 const enableSound=async()=>{if(sound){setSound(false);try{window.localStorage.setItem(soundKey,"off")}catch{}return;}try{audio.current??=new AudioContext();await audio.current.resume();setSound(true);try{window.localStorage.setItem(soundKey,"on")}catch{}setError("")}catch{setError("浏览器未允许声音，请检查音频权限。")}};
 const toggleOpen=async()=>{if(!open&&sound&&!audio.current){try{audio.current=new AudioContext();await audio.current.resume()}catch{}}setOpen(v=>!v)};
 const counts=kinds.map(([kind,label])=>({kind,label,count:kind==="inquiries"?newInquiryCount:alerts.filter(x=>x.kind===kind).length}));
 const total=newInquiryCount+alerts.length;
 return <div className="sctAdminNotifications" ref={rootRef}>
  <button type="button" className="sctAdminBell" onClick={()=>void toggleOpen()} aria-expanded={open} aria-label={"通知中心，"+total+" 条待处理提醒"}>🔔 提醒{total>0&&<strong>{total}</strong>}</button>
  {open&&<div className="sctAdminNotificationPanel"><div className="sctAdminNotificationTitle"><b>新消息提醒</b><button type="button" onClick={()=>setAlerts([])}>清除已读消息</button></div>
   <p>新询盘状态未变更前会持续提醒；其他新消息约每 30 秒检查一次。</p>
   {counts.map(x=><button type="button" key={x.kind} className="sctAdminNoticeRow" onClick={()=>{onNavigate(x.kind);setAlerts(prev=>prev.filter(a=>a.kind!==x.kind));setOpen(false)}}><span>{x.label}</span><b>{x.count}</b><span>查看 →</span></button>)}
   <label className="sctAdminSound"><input type="checkbox" checked={sound} onChange={()=>void enableSound()}/> 新消息提示音（点击启用）</label>
   {error&&<small role="status">{error}</small>}
  </div>}
 </div>;
}
