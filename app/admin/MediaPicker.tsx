"use client";
import {useMemo,useState} from "react";
import {createClient} from "../../utils/supabase/client";

type MediaItem={path:string;url:string;name:string};
type MediaTag={destination:string;purpose:string};
const BUCKET="website-media";
const PAGE_SIZE=100;
const MAX_IMAGES=3000;
const DESTINATIONS:[string,string[]][]=[
 ["北京",["beijing","北京"]],["上海",["shanghai","上海"]],["西安",["xian","xi-an","西安"]],
 ["张家界",["zhangjiajie","张家界","tianmen","天门山","fenghuang","凤凰","furong","芙蓉"]],
 ["重庆",["chongqing","重庆","wulong","武隆"]],["成都·四川",["chengdu","sichuan","成都","四川","jiuzhai","九寨"]],
 ["桂林",["guilin","yangshuo","桂林","阳朔"]],["云南",["yunnan","dali","lijiang","shangrila","shangri-la","云南","大理","丽江","香格里拉"]],
 ["贵州",["guizhou","贵州"]],["杭州·苏州",["hangzhou","suzhou","杭州","苏州"]],
 ["哈尔滨",["harbin","哈尔滨"]],["新疆",["xinjiang","新疆"]],["西藏",["tibet","xizang","西藏"]]
];
const PURPOSES:[string,string[]][]=[
 ["团队与公司",["about/","team-","staff","company","logo","brand"]],
 ["首页与横幅",["hero","banner","homepage","home/","slider"]],
 ["线路图片",["tours/","tour/","tour-","tour_","day-","itinerary"]],
 ["目的地图片",["destinations/","destination/","destination-"]],
 ["攻略与正文",["content/","travel-guide","guides/","guide-","article"]]
];
function classify(path:string,groups:[string,string[]][],fallback:string){
 const p=path.toLowerCase();
 return groups.find(([,terms])=>terms.some(t=>p.includes(t.toLowerCase())))?.[0]??fallback;
}


/** Reuse an existing Storage object URL without uploading a duplicate. */
export default function MediaPicker({onSelect,label="从素材库选择"}:{onSelect:(url:string)=>void;label?:string}){
 const supabase=useMemo(()=>createClient(),[]);
 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [items,setItems]=useState<MediaItem[]>([]);
 const [tags,setTags]=useState<Record<string,MediaTag>>({});
 const [editingPath,setEditingPath]=useState<string|null>(null);
 const [editDestination,setEditDestination]=useState("");
 const [editPurpose,setEditPurpose]=useState("");
 const [savingTag,setSavingTag]=useState(false);
 const [tagReady,setTagReady]=useState(false);
 const [query,setQuery]=useState("");
 const [destination,setDestination]=useState("全部目的地");
 const [purpose,setPurpose]=useState("全部用途");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [page,setPage]=useState(0);
 async function load(){
  setLoading(true);setError("");setNotice("");setTagReady(false);
  const found:MediaItem[]=[];
  const queue:[string,number][]=[["",0]];
  let truncated=false;
  try{
   while(queue.length && found.length<MAX_IMAGES){
    const [folder,depth]=queue.shift()!;
    for(let offset=0;;offset+=PAGE_SIZE){
     const {data,error:listError}=await supabase.storage.from(BUCKET).list(folder,{limit:PAGE_SIZE,offset,sortBy:{column:"name",order:"asc"}});
     if(listError)throw listError;
     for(const item of data??[]){
      if(!item.name || item.name===".emptyFolderPlaceholder")continue;
      const path=folder?folder+"/"+item.name:item.name;
      if(item.id==null){
       if(depth<5)queue.push([path,depth+1]);
      }else if(/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(item.name)){
       found.push({path,name:item.name,url:supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl});
       if(found.length>=MAX_IMAGES){truncated=true;break;}
      }
     }
     if(found.length>=MAX_IMAGES || (data??[]).length<PAGE_SIZE)break;
    }
   }
   setItems(found);
   const {data:tagRows,error:tagError}=await supabase.from("media_library_tags").select("object_path,destination,purpose").eq("bucket",BUCKET).limit(5000);
   if(tagError){setError("共享分类暂不可用："+tagError.message+"。请先执行 PR #207 的数据库迁移。");setTags({});}
   else {setTags(Object.fromEntries((tagRows??[]).map(t=>[t.object_path,{destination:t.destination??"",purpose:t.purpose??""}])));setTagReady(true);}

   if(truncated||queue.length)setNotice("素材较多，目前仅显示前 "+MAX_IMAGES+" 张。请按名称搜索已加载的图片。");
   else if(!found.length)setNotice("素材库暂无可读取的图片。");
  }catch(e){setError("读取素材库失败："+(e instanceof Error?e.message:String(e))+"。请检查 Storage 的读取权限。");}
  finally{setLoading(false);}
 }
 async function saveTag(){
  if(!editingPath)return;
  setSavingTag(true);setError("");
  const value={destination:editDestination,purpose:editPurpose};
  const {data:userData,error:userError}=await supabase.auth.getUser();
  if(userError||!userData.user){setError("登录状态已失效，请重新登录。");setSavingTag(false);return;}
  const {error:saveError}=await supabase.from("media_library_tags").upsert({
   bucket:BUCKET,object_path:editingPath,...value,updated_at:new Date().toISOString(),
   updated_by:userData.user.id
  },{onConflict:"bucket,object_path"});
  if(saveError)setError("分类保存失败："+saveError.message);
  else {setTags(prev=>({...prev,[editingPath]:value}));setEditingPath(null);}
  setSavingTag(false);
 }
 function openTag(item:MediaItem){
  setEditingPath(item.path);setEditDestination(tags[item.path]?.destination??"");setEditPurpose(tags[item.path]?.purpose??"");
 }
 function openPicker(){setOpen(true);setPage(0);setQuery("");setEditingPath(null);setDestination("全部目的地");setPurpose("全部用途");void load();}
 const getDestination=(x:MediaItem)=>tags[x.path]?.destination||"未分类";
 const getPurpose=(x:MediaItem)=>tags[x.path]?.purpose||"未分类";
 const filtered=items.filter(x=>x.path.toLowerCase().includes(query.trim().toLowerCase())&&(destination==="全部目的地"||getDestination(x)===destination)&&(purpose==="全部用途"||getPurpose(x)===purpose));
 const shown=filtered.slice(page*36,(page+1)*36);
 return <>
  <button type="button" onClick={openPicker} style={{display:"inline-flex",width:"auto",minWidth:0,flex:"0 0 auto",alignItems:"center",justifyContent:"center",padding:"7px 12px",border:"1px solid #cbd5e1",borderRadius:7,background:"#f8fafc",color:"#163b60",fontSize:13,cursor:"pointer"}}>{label}</button>
  {open&&<div role="dialog" aria-modal="true" aria-label="选择已上传图片" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.6)",display:"flex",justifyContent:"center",alignItems:"center",padding:16}}>
   <div style={{background:"white",color:"#172b4d",borderRadius:12,width:"min(920px,100%)",maxHeight:"90vh",overflow:"auto",padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><h3>已上传图片素材库</h3><button type="button" onClick={()=>setOpen(false)}>关闭 ×</button></div>
    <p style={{fontSize:13}}>直接使用原图片地址，不会重复上传。选择后仍需保存当前编辑页面。</p>
    <input aria-label="搜索素材名称或文件夹" placeholder="搜索文件名或文件夹…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} style={{width:"100%",padding:10,marginBottom:12}}/>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:12}}>
     <label style={{flex:"1 1 190px",fontSize:13}}>目的地分类
      <select aria-label="目的地分类" value={destination} onChange={e=>{setDestination(e.target.value);setPage(0)}} style={{display:"block",width:"100%",padding:9}}>
       {["全部目的地",...DESTINATIONS.map(([name])=>name),"其他目的地","未分类"].map(name=><option key={name} value={name}>{name}（{name==="全部目的地"?items.length:items.filter(x=>getDestination(x)===name).length}）</option>)}
      </select>
     </label>
     <label style={{flex:"1 1 190px",fontSize:13}}>图片用途
      <select aria-label="图片用途" value={purpose} onChange={e=>{setPurpose(e.target.value);setPage(0)}} style={{display:"block",width:"100%",padding:9}}>
       {["全部用途",...PURPOSES.map(([name])=>name),"其他图片","未分类"].map(name=><option key={name} value={name}>{name}（{name==="全部用途"?items.length:items.filter(x=>getPurpose(x)===name).length}）</option>)}
      </select>
     </label>
     <button type="button" onClick={()=>{setQuery("");setDestination("全部目的地");setPurpose("全部用途");setPage(0)}}>重置筛选</button>
    </div>
    <p style={{fontSize:12,color:"#64748b"}}>点击图片下方的“分类”可手动设置目的地和用途，分类由所有管理员共享。原图和 URL 保持不变。</p>
    {loading&&<p>正在读取已上传图片，请稍候…</p>}
    {error&&<p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
    {notice&&<p>{notice}</p>}
    {!loading&&<p style={{fontSize:13}}>找到 {filtered.length} 张图片</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(125px,1fr))",gap:12}}>
     {shown.map(item=><button type="button" key={item.path} title={item.path} onClick={()=>{onSelect(item.url);setOpen(false)}} style={{padding:6,border:"1px solid #ddd",borderRadius:8,background:"#fff",minWidth:0}}>
      <img src={item.url} alt={item.name} loading="lazy" style={{width:"100%",height:100,objectFit:"cover",borderRadius:5}}/>
      <span style={{display:"block",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</span>
     </button>)}
    </div>
    {!loading&&filtered.length>36&&<div style={{display:"flex",gap:12,alignItems:"center",justifyContent:"center",marginTop:16}}>
     <button type="button" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>上一页</button><span>{page+1} / {Math.ceil(filtered.length/36)}</span><button type="button" disabled={(page+1)*36>=filtered.length} onClick={()=>setPage(p=>p+1)}>下一页</button>
    </div>}
   </div>
  </div>}
 </>;
}
