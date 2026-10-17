"use client";
import {useMemo,useState} from "react";
import {createClient} from "../../utils/supabase/client";

type MediaItem={path:string;url:string;name:string};
const BUCKET="website-media";
const PAGE_SIZE=100;
const MAX_IMAGES=3000;

/** Reuse an existing Storage object URL without uploading a duplicate. */
export default function MediaPicker({onSelect,label="从素材库选择"}:{onSelect:(url:string)=>void;label?:string}){
 const supabase=useMemo(()=>createClient(),[]);
 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [items,setItems]=useState<MediaItem[]>([]);
 const [query,setQuery]=useState("");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [page,setPage]=useState(0);
 async function load(){
  setLoading(true);setError("");setNotice("");
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
   if(truncated||queue.length)setNotice("素材较多，目前仅显示前 "+MAX_IMAGES+" 张。请按名称搜索已加载的图片。");
   else if(!found.length)setNotice("素材库暂无可读取的图片。");
  }catch(e){setError("读取素材库失败："+(e instanceof Error?e.message:String(e))+"。请检查 Storage 的读取权限。");}
  finally{setLoading(false);}
 }
 function openPicker(){setOpen(true);setPage(0);void load();}
 const filtered=items.filter(x=>(x.path.toLowerCase().includes(query.trim().toLowerCase())));
 const shown=filtered.slice(page*36,(page+1)*36);
 return <>
  <button type="button" onClick={openPicker}>{label}</button>
  {open&&<div role="dialog" aria-modal="true" aria-label="选择已上传图片" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.6)",display:"flex",justifyContent:"center",alignItems:"center",padding:16}}>
   <div style={{background:"white",color:"#172b4d",borderRadius:12,width:"min(920px,100%)",maxHeight:"90vh",overflow:"auto",padding:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><h3>已上传图片素材库</h3><button type="button" onClick={()=>setOpen(false)}>关闭 ×</button></div>
    <p style={{fontSize:13}}>直接使用原图片地址，不会重复上传。选择后仍需保存当前编辑页面。</p>
    <input aria-label="搜索素材名称或文件夹" placeholder="搜索文件名或文件夹…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} style={{width:"100%",padding:10,marginBottom:12}}/>
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
