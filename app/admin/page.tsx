"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/client";

const sections = [
  ["控制台", "dashboard"],
  ["网站设置", "site_settings"],
  ["首页管理", "homepage_sections"],
  ["关于我们", "about_us"],
  ["目的地管理", "destinations"],
  ["旅游线路", "tours"],
  ["旅行攻略", "travel_guides"],
  ["媒体库", "media"],
  ["客户咨询", "inquiries"],
  ["客户管理", "customers"],
  ["订单管理", "bookings"],
] as const;

type TableName = Exclude<(typeof sections)[number][1], "dashboard" | "media" | "about_us">;
type RecordRow = Record<string, unknown>;

const editableTables = new Set(["site_settings", "homepage_sections", "destinations", "tours", "travel_guides"]);
const heroPages=[["home","首页"],["tours","Tours 页面"],["destinations","Destinations 页面"],["travel-guide","Travel Guide 页面"],["about","About Us 页面"],["quote","Plan Your Trip 页面"]] as const;
function navIcon(key: string) {
  const icons: Record<string, string> = {
    dashboard: "⌂", site_settings: "⚙", homepage_sections: "◇", about_us: "◎", destinations: "✦",
    tours: "✈", travel_guides: "▤", media: "▦", inquiries: "✉", customers: "♟", bookings: "✓",
  };
  return icons[key] ?? "•";
}


function formatValue(value: unknown) {
  if (value == null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState<(typeof sections)[number][1]>("dashboard");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const loadTable = useCallback(async (table: TableName) => {
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.from(table).select("*").limit(50);
    setRows((data as RecordRow[] | null) ?? []);
    if (error) setMessage(error.message);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (session && active !== "dashboard" && active !== "media" && active !== "about_us") loadTable(active);
  }, [active, loadTable, session]);

  if (checking) return <main className="adminGate"><div className="adminLogin"><b className="adminLogo">SCT</b><p>正在验证登录状态…</p></div></main>;
  if (!session) return <Login />;

  const title = sections.find((item) => item[1] === active)?.[0] ?? "控制台";

  return <main className="adminShell">
    <aside className="adminSidebar">
      <div className="adminBrand"><span>S<span>C</span>T</span><div><b>SEEK CHINA</b><small>管理后台</small></div></div>
      <nav aria-label="Admin navigation">{sections.map(([label, key]) => <button className={active === key ? "active" : ""} key={key} onClick={() => setActive(key)}><span>{navIcon(key as string)}</span>{label}</button>)}</nav>
      <div className="adminAccount"><small>当前登录</small><span title={session.user.email}>{session.user.email}</span><button onClick={() => supabase.auth.signOut()}>退出登录</button></div>
    </aside>
    <section className="adminWorkspace">
      <header className="adminHeader"><div><p>SEEK CHINA TRAVEL</p><h1>{title}</h1></div><span className="adminStatus"><i /> 数据库已连接</span></header>
      {active === "dashboard" ? <控制台 onNavigate={setActive} /> : active === "media" ? <MediaLibrary /> : active === "homepage_sections" ? <HeroManager rows={rows} onRefresh={() => loadTable("homepage_sections")} /> : active === "destinations" ? <DestinationManager rows={rows} loading={loading} message={message} onRefresh={() => loadTable("destinations")} /> : active === "tours" ? <TourManager rows={rows} loading={loading} message={message} onRefresh={() => loadTable("tours")} /> : active === "site_settings" ? <SiteChromeManager /> : active === "about_us" ? <AboutManager /> : active === "travel_guides" ? <GuideManager rows={rows} loading={loading} message={message} onRefresh={() => loadTable("travel_guides")} /> : active === "inquiries" ? <InquiryManager rows={rows} loading={loading} message={message} onRefresh={() => loadTable("inquiries")} /> : <Collection table={active} title={title} rows={rows} loading={loading} message={message} onRefresh={() => loadTable(active)} />}
    </section>
  </main>;
}

function AboutManager(){const supabase=useMemo(()=>createClient(),[]);const base={heroEyebrow:"ABOUT SEEK CHINA TRAVEL",heroTitle:"China, made personal.",heroText:"We are a China-based travel team creating private and tailor-made journeys for international travelers who want to experience the country with more ease, depth and confidence.",heroButton:"Plan Your China Trip →",heroLink:"/quote",mainImage:"",smallImage:"",storyEyebrow:"WHO WE ARE",storyTitle:"Local knowledge. Thoughtful journeys.",storyText:"",visualEyebrow:"BEYOND THE LANDMARKS",visualTitle:"See more of the China in between.",visualImage:"",values:[["China-based expertise","Planning grounded in local destination knowledge, logistics and real travel experience."],["Designed around you","Private and flexible journeys shaped around your dates, pace, interests and travel style."],["Clear & dependable","Thoughtful arrangements, clear inclusions and support from planning through your journey."],["More than sightseeing","We help travelers connect with China's culture, landscapes, food and everyday life."]],approachEyebrow:"OUR APPROACH",approachTitle:"Discover China.\nYour Way.",approachText:"",ctaEyebrow:"START YOUR JOURNEY",ctaTitle:"Ready to see China differently?",ctaText:""};const [d,setD]=useState<any>(base);const [msg,setMsg]=useState("");useEffect(()=>{supabase.from("homepage_sections").select("content").eq("section_key","page:about").maybeSingle().then(({data})=>{if(data?.content)try{setD({...base,...(typeof data.content==="string"?JSON.parse(data.content):data.content)})}catch{}})},[supabase]);async function upload(key:string,file?:File){if(!file)return;const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="about/"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file);if(error){setMsg(error.message);return}const {data}=supabase.storage.from("website-media").getPublicUrl(path);setD((x:any)=>({...x,[key]:data.publicUrl}));setMsg("图片已上传，请点击保存。")}async function save(){const {data}=await supabase.from("homepage_sections").select("id").eq("section_key","page:about").maybeSingle();const payload={section_key:"page:about",section_name:"About Us 页面",title:"About Us",content:JSON.stringify(d),is_active:true};const {error}=data?.id?await supabase.from("homepage_sections").update(payload).eq("id",data.id):await supabase.from("homepage_sections").insert(payload);setMsg(error?"保存失败："+error.message:"About Us 已保存并同步到前台。")}const field=(label:string,key:string,area=false)=><label><span>{label}</span>{area?<textarea rows={4} value={d[key]||""} onChange={e=>setD({...d,[key]:e.target.value})}/>:<input value={d[key]||""} onChange={e=>setD({...d,[key]:e.target.value})}/>}</label>;const image=(label:string,key:string)=><label><span>{label}</span>{d[key]&&<img src={d[key]} alt="" style={{width:"100%",height:120,objectFit:"cover",marginBottom:8,borderRadius:8}}/>}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>upload(key,e.target.files?.[0])}/></label>;return <section className="adminPanel"><header><div><h2>About Us 页面</h2><p>修改公司简介页的英文文字、图片和四项品牌理念。</p></div><a href="/about" target="_blank" rel="noreferrer">查看前台 ↗</a></header><div className="destinationCard"><div className="destinationFormGrid">{field("顶部小标题","heroEyebrow")}{field("顶部主标题","heroTitle")}{field("顶部简介","heroText",true)}{field("顶部按钮文字","heroButton")}{field("顶部按钮链接","heroLink")}{image("公司故事主图","mainImage")}{image("公司故事叠加小图","smallImage")}{field("Who We Are 小标题","storyEyebrow")}{field("Who We Are 标题","storyTitle")}{field("公司简介正文","storyText",true)}{image("中间全宽背景图","visualImage")}{field("中间图片小标题","visualEyebrow")}{field("中间图片标题","visualTitle")}{d.values.map((v:any[],i:number)=><div key={i} style={{display:"grid",gap:8}}><b>理念 {i+1}</b><input value={v[0]} onChange={e=>{const x=d.values.map((z:any[])=>[...z]);x[i][0]=e.target.value;setD({...d,values:x})}}/><textarea rows={3} value={v[1]} onChange={e=>{const x=d.values.map((z:any[])=>[...z]);x[i][1]=e.target.value;setD({...d,values:x})}}/></div>)}{field("Our Approach 小标题","approachEyebrow")}{field("Our Approach 标题","approachTitle")}{field("Our Approach 正文","approachText",true)}{field("底部 CTA 小标题","ctaEyebrow")}{field("底部 CTA 标题","ctaTitle")}{field("底部 CTA 正文","ctaText",true)}</div>{msg&&<p className="tourSuccess">{msg}</p>}<button className="adminPrimary" onClick={save}>保存 About Us</button></div></section>}

function SiteChromeManager(){const supabase=useMemo(()=>createClient(),[]);const base={header:"Home|/\nTours|/tours\nDestinations|/destinations\nTravel Guide|/travel-guide\nAbout Us|/about\nContact Us|#contact",footerExplore:"Tours|/tours\nDestinations|/destinations\nTravel Guide|/travel-guide\nAbout Us|/about",footerPlan:"Tailor-made Trips|/quote\nSmall Groups|/quote\nGet a Quote|/quote",footerConnect:"Email Us|mailto:hello@seekchinatravel.com\nContact Us|/quote",ctaLabel:"Get a Quote",ctaHref:"/quote",footerText:"Meaningful journeys, thoughtfully designed by people who call China home.",footerSlogan:"Discover China. Your Way.",logoUrl:""};const [d,setD]=useState(base);const [msg,setMsg]=useState("");const [saving,setSaving]=useState(false);const [uploading,setUploading]=useState(false);useEffect(()=>{supabase.from("homepage_sections").select("*").eq("section_key","site:chrome").maybeSingle().then(({data})=>{if(!data?.content)return;try{const x=typeof data.content==="string"?JSON.parse(data.content):data.content;const lines=(a:{label:string;href:string}[])=>(a||[]).map(v=>v.label+"|"+v.href).join("\n");setD({...base,header:lines(x.header),footerExplore:lines(x.footerExplore),footerPlan:lines(x.footerPlan),footerConnect:lines(x.footerConnect),ctaLabel:x.headerCta?.label||base.ctaLabel,ctaHref:x.headerCta?.href||base.ctaHref,footerText:x.footerText||base.footerText,footerSlogan:x.footerSlogan||base.footerSlogan,logoUrl:x.logoUrl||""});}catch{}})},[supabase]);const parse=(v:string)=>v.split("\n").map(x=>x.trim()).filter(Boolean).map(x=>{const n=x.indexOf("|");return{label:(n<0?x:x.slice(0,n)).trim(),href:(n<0?"#":x.slice(n+1)).trim()}});async function uploadLogo(file?:File){if(!file)return;setUploading(true);setMsg("");const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="branding/logo-"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file);if(error)setMsg("Logo 上传失败："+error.message);else{const {data}=supabase.storage.from("website-media").getPublicUrl(path);setD(v=>({...v,logoUrl:data.publicUrl}));setMsg("Logo 已上传，请点击保存。");}setUploading(false)}async function save(){setSaving(true);setMsg("");const content={header:parse(d.header),footerExplore:parse(d.footerExplore),footerPlan:parse(d.footerPlan),footerConnect:parse(d.footerConnect),headerCta:{label:d.ctaLabel,href:d.ctaHref},footerText:d.footerText,footerSlogan:d.footerSlogan,logoUrl:d.logoUrl};const {data}=await supabase.from("homepage_sections").select("id").eq("section_key","site:chrome").maybeSingle();const payload={section_key:"site:chrome",section_name:"顶部导航与页脚",title:"Site Navigation",content:JSON.stringify(content),is_active:true};const {error}=data?.id?await supabase.from("homepage_sections").update(payload).eq("id",data.id):await supabase.from("homepage_sections").insert(payload);setMsg(error?"保存失败："+error.message:"已保存，Logo、顶部导航和页脚已同步到前台。");setSaving(false)}const area=(label:string,key:"header"|"footerExplore"|"footerPlan"|"footerConnect")=><label className="chromeLinkField"><span>{label}</span><textarea rows={5} value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}/><small>每行一个：显示文字|链接地址</small></label>;return <section className="adminPanel siteChromeAdmin"><header><div><h2>顶部导航与页脚</h2><p>管理网站 Logo、顶部菜单、按钮及底部文字链接。</p></div></header><div className="destinationCard"><div className="siteChromeSection"><div className="destinationCardTitle"><b>品牌 Logo</b><span>上传后同时用于网站顶部和底部。</span></div>{d.logoUrl&&<div className="siteLogoPreview"><img src={d.logoUrl} alt="Current website logo"/></div>}<label className="chromeUpload"><span>上传 Logo</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={uploading} onChange={e=>uploadLogo(e.target.files?.[0])}/><small>建议使用透明背景 PNG / WebP / SVG。</small></label></div><div className="siteChromeSection"><div className="destinationCardTitle"><b>顶部导航</b><span>一行一个菜单，文字和链接分别填写。</span></div>{area("顶部导航菜单","header")}<div className="chromeTwoCols"><label><span>顶部按钮文字</span><input value={d.ctaLabel} onChange={e=>setD({...d,ctaLabel:e.target.value})}/></label><label><span>顶部按钮链接</span><input value={d.ctaHref} onChange={e=>setD({...d,ctaHref:e.target.value})}/></label></div></div><div className="siteChromeSection"><div className="destinationCardTitle"><b>底部 Footer</b><span>分别管理三组链接及品牌文字。</span></div><div className="chromeFooterGrid">{area("Explore 链接","footerExplore")}{area("Plan 链接","footerPlan")}{area("Connect 链接","footerConnect")}</div><label className="chromeLinkField"><span>底部公司简介</span><textarea rows={3} value={d.footerText} onChange={e=>setD({...d,footerText:e.target.value})}/></label><label className="chromeLinkField"><span>底部品牌标语</span><input value={d.footerSlogan} onChange={e=>setD({...d,footerSlogan:e.target.value})}/></label></div>{msg&&<p className="tourSuccess">{msg}</p>}<button className="adminPrimary" disabled={saving} onClick={save}>{saving?"正在保存…":"保存网站设置"}</button></div></section>}

function Login() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setBusy(false);
  }
  return <main className="adminGate"><form className="adminLogin" onSubmit={submit}>
    <div className="adminLoginBrand"><b>S<span>C</span>T</b><div>SEEK CHINA<small>网站管理系统</small></div></div>
    <p className="adminKicker">SECURE 管理后台</p><h1>欢迎回来</h1><p>登录后管理 SEEK CHINA TRAVEL 网站。</p>
    <label>邮箱<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@seekchinatravel.com" /></label>
    <label>密码<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" /></label>
    {message && <p className="adminError" role="alert">{message}</p>}
    <button className="adminPrimary" disabled={busy}>{busy ? "正在登录…" : "安全登录"}<span>→</span></button>
    <small className="adminSecurity">由 Supabase Auth 提供登录保护，数据权限由 RLS 安全策略控制。</small>
  </form></main>;
}

function 控制台({ onNavigate }: { onNavigate: (key: (typeof sections)[number][1]) => void }) {
  const cards = [["目的地管理", "管理目的地与亮点", "destinations"], ["旅游线路", "管理线路与行程", "tours"], ["客户咨询", "查看新的旅行咨询", "inquiries"], ["Media", "上传网站图片", "media"]] as const;
  return <><section className="adminWelcome"><div><p>内容与运营</p><h2>一个后台，管理整个网站。</h2><span>集中管理旅游内容、客户咨询和网站运营，英文前台保持不变。</span></div><div className="adminWelcomeMark">中国</div></section>
  <div className="adminQuick"><h2>快捷入口</h2><div>{cards.map(([name, description, key], index) => <button key={name} onClick={() => onNavigate(key)}><b>0{index + 1}</b><h3>{name}</h3><p>{description}</p><span>进入管理 →</span></button>)}</div></div>
  <section className="adminNotice"><span>●</span><div><b>安全稳定</b><p>后台运行于 Cloudflare Pages，Supabase Auth 与 RLS 负责保护数据访问。</p></div></section></>;
}


const destinationLabels: Record<string, string> = {
  name: "目的地英文名称", slug: "URL 标识", country: "国家", region: "所属区域",
  short_description: "简短介绍", description: "详细介绍", content: "详细内容",
  hero_image_url: "目的地主图", image_url: "旧图片字段", cover_image_url: "旧图片字段",
  featured_image_url: "旧图片字段", is_featured: "首页推荐", featured: "首页推荐",
  is_published: "发布到网站", published: "发布到网站", sort_order: "显示顺序", display_order: "显示顺序",
};
function destinationLabel(field: string) {
  return destinationLabels[field] ?? field.replaceAll("_", " ");
}
function isImageField(field: string) {
  return /image|photo|banner|cover|thumbnail/i.test(field) && /url|image|photo/i.test(field);
}
function isLongField(field: string, value: unknown) {
  return /description|content|summary|intro|overview/i.test(field) || (typeof value === "string" && value.length > 80);
}


function RichTextEditor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const supabase = useMemo(() => createClient(), []);
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  function sync() {
    onChange(editorRef.current?.innerHTML ?? "");
  }
  function command(name: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    sync();
  }
  function addLink() {
    const url = window.prompt("请输入链接地址，例如 https://example.com");
    if (url) command("createLink", url);
  }
  function styleImage(width?: string, align?: "left" | "center" | "right") {
    if (!selectedImage) return;
    if (width) { selectedImage.style.width = width; selectedImage.style.maxWidth = "100%"; selectedImage.style.height = "auto"; }
    if (align) {
      selectedImage.style.display = "block";
      selectedImage.style.marginLeft = align === "left" ? "0" : align === "center" ? "auto" : "auto";
      selectedImage.style.marginRight = align === "right" ? "0" : align === "center" ? "auto" : "auto";
    }
    sync();
  }
  async function addImage(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = "content/" + Date.now() + "-" + safeName;
    const { error: uploadError } = await supabase.storage.from("website-media").upload(path, file, { upsert: false });
    if (uploadError) setError("图片上传失败：" + uploadError.message);
    else {
      const { data } = supabase.storage.from("website-media").getPublicUrl(path);
      command("insertImage", data.publicUrl);
    }
    setUploading(false);
  }

  return <div className="richField">
    <span className="richLabel">{label}</span>
    <div className="richEditor">
      <div className="richToolbar" onMouseDown={(e) => { if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault(); }}>
        <select aria-label="段落样式" defaultValue="p" onChange={(e) => command("formatBlock", e.target.value)}>
          <option value="p">正文</option><option value="h2">标题 2</option><option value="h3">标题 3</option><option value="blockquote">引用</option>
        </select>
        <button type="button" title="粗体" onClick={() => command("bold")}><b>B</b></button>
        <button type="button" title="斜体" onClick={() => command("italic")}><i>I</i></button>
        <button type="button" title="下划线" onClick={() => command("underline")}><u>U</u></button>
        <button type="button" title="项目符号" onClick={() => command("insertUnorderedList")}>• 列表</button>
        <button type="button" title="编号列表" onClick={() => command("insertOrderedList")}>1. 列表</button>
        <button type="button" title="插入链接" onClick={addLink}>🔗 链接</button>
        <label className="richImageButton">{uploading ? "上传中…" : "▧ 图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(e) => addImage(e.target.files?.[0])}/></label>
        <button type="button" title="撤销" onClick={() => command("undo")}>↶</button>
        <button type="button" title="重做" onClick={() => command("redo")}>↷</button>
        <button type="button" title="清除格式" onClick={() => command("removeFormat")}>清除格式</button>
      </div>
      {selectedImage && <div className="richImageTools"><b>已选择图片</b><span>大小</span>{["25%","50%","75%","100%"].map((size) => <button type="button" key={size} onClick={() => styleImage(size)}>{size}</button>)}<i/><span>对齐</span><button type="button" onClick={() => styleImage(undefined,"left")}>左</button><button type="button" onClick={() => styleImage(undefined,"center")}>居中</button><button type="button" onClick={() => styleImage(undefined,"right")}>右</button><button type="button" className="richImageDone" onClick={() => setSelectedImage(null)}>完成</button></div>}
      <div ref={editorRef} className="richCanvas" contentEditable suppressContentEditableWarning onInput={sync} onClick={(e) => { const target = e.target as HTMLElement; setSelectedImage(target.tagName === "IMG" ? target as HTMLImageElement : null); }} data-placeholder="在这里编辑英文详细介绍…"/>
    </div>
    {error && <small className="richError">{error}</small>}
    <small className="richHint">支持标题、粗体、斜体、列表、链接和正文图片；点击正文图片可调整 25% / 50% / 75% / 100% 大小及对齐方式。</small>
  </div>;
}

function DestinationManager({ rows, loading, message, onRefresh }: { rows: RecordRow[]; loading: boolean; message: string; onRefresh: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [draft, setDraft] = useState<RecordRow>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  function openEditor(row?: RecordRow) {
    setActionMessage("");
    if (row) { setEditing(row); setDraft({ ...row }); return; }
    const template = rows[0] ? Object.fromEntries(Object.entries(rows[0])
      .filter(([key]) => !["id","created_at","updated_at"].includes(key))
      .map(([key,value]) => [key, typeof value === "boolean" ? false : ""])) : {};
    setEditing({}); setDraft(template);
  }

  async function uploadImage(field: string, file?: File) {
    if (!file) return;
    setUploading(field); setActionMessage("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = "destinations/" + Date.now() + "-" + safeName;
    const { error } = await supabase.storage.from("website-media").upload(path, file, { upsert: false });
    if (error) setActionMessage("图片上传失败：" + error.message);
    else {
      const { data } = supabase.storage.from("website-media").getPublicUrl(path);
      setDraft((current) => ({ ...current, [field]: data.publicUrl }));
    }
    setUploading("");
  }

  async function save() {
    setSaving(true); setActionMessage("");
    const payload = Object.fromEntries(Object.entries(draft)
      .filter(([key]) => !["id","created_at","updated_at"].includes(key))
      .map(([key,value]) => [key, value === "" ? null : value]));
    const id = editing?.id;
    const query = id == null ? supabase.from("destinations").insert(payload) : supabase.from("destinations").update(payload).eq("id", id);
    const { error } = await query;
    if (error) setActionMessage(error.message); else { setEditing(null); onRefresh(); }
    setSaving(false);
  }

  async function remove(row: RecordRow) {
    if (row.id == null || !confirm("确定删除这个目的地吗？此操作无法撤销。")) return;
    const { error } = await supabase.from("destinations").delete().eq("id", row.id);
    if (error) setActionMessage(error.message); else onRefresh();
  }

  const fields = editing ? Object.keys(draft).filter((key) => !["id","created_at","updated_at"].includes(key)) : [];
  const imageFields: string[] = fields.filter((field) => field === "hero_image_url");
  const toggleFields = fields.filter((field) => typeof draft[field] === "boolean" || /^(is_|featured$|published$)/.test(field));
  const hiddenDestinationFields = ["image_url","cover_image_url","featured_image_url"];
  const textFields = fields.filter((field) => !imageFields.includes(field) && !toggleFields.includes(field) && !hiddenDestinationFields.includes(field));
  const primaryFields = textFields.filter((field) => !isLongField(field,draft[field]));
  const longFields = textFields.filter((field) => isLongField(field,draft[field]));

  if (editing) return <section className="destinationEditor">
    <header className="destinationEditorHead"><div><button className="adminBack" onClick={() => setEditing(null)}>← 返回目的地列表</button><p>目的地内容编辑</p><h2>{editing.id == null ? "新增目的地" : String(draft.name || "编辑目的地")}</h2><span>后台使用中文操作；游客看到的名称和介绍请填写英文。</span></div><div className="destinationEditorActions"><button onClick={() => setEditing(null)}>取消</button><button className="adminPrimary" disabled={saving || fields.length === 0} onClick={save}>{saving ? "正在保存…" : "保存目的地"}</button></div></header>
    {actionMessage && <div className="adminEmpty error destinationError"><b>操作未完成</b><p>{actionMessage}</p></div>}
    {fields.length === 0 ? <div className="destinationCard"><p>暂时无法读取字段结构，请返回列表刷新后重试。</p></div> : <>
      <div className="destinationCard"><div className="destinationCardTitle"><b>基本信息</b><span>用于前台页面标题、链接和目的地分类。</span></div><div className="destinationFormGrid">
        {primaryFields.map((field) => <label key={field}><span>{destinationLabel(field)}</span><input value={formatValue(draft[field]) === "—" ? "" : formatValue(draft[field])} placeholder={field === "slug" ? "例如：chongqing" : ""} onChange={(e) => setDraft({...draft,[field]:e.target.value})}/>{field === "slug" && <small>建议只使用小写英文和短横线，例如 zhangjiajie。</small>}</label>)}
      </div></div>
      {imageFields.length > 0 && <div className="destinationCard"><div className="destinationCardTitle"><b>图片管理</b><span>只需维护一张目的地主图；首页卡片和目的地详情页会共用这张图片。</span></div><div className="destinationImages">{imageFields.map((field) => {
        const url = typeof draft[field] === "string" ? String(draft[field]) : "";
        return <div className="destinationImageBox" key={field}><span>{destinationLabel(field)}</span>{url ? <img src={url} alt="" /> : <div className="destinationImageEmpty">暂无图片</div>}<div><label className="destinationUpload">{uploading === field ? "上传中…" : "上传 / 更换图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!!uploading} onChange={(e) => uploadImage(field,e.target.files?.[0])}/></label>{url && <button onClick={() => setDraft({...draft,[field]:""})}>移除</button>}</div><input value={url} placeholder="或粘贴图片 URL" onChange={(e) => setDraft({...draft,[field]:e.target.value})}/></div>
      })}</div></div>}
      {longFields.length > 0 && <div className="destinationCard"><div className="destinationCardTitle"><b>目的地内容</b><span>简短介绍使用纯文本；详细介绍支持排版、链接和正文图片。</span></div><div className="destinationLongFields">{longFields.map((field) => field === "short_description" || /summary/i.test(field) ? <label key={field}><span>{destinationLabel(field)}</span><textarea rows={4} value={formatValue(draft[field]) === "—" ? "" : formatValue(draft[field])} onChange={(e) => setDraft({...draft,[field]:e.target.value})}/><small>{String(draft[field] ?? "").length} 个字符</small></label> : <RichTextEditor key={field} label={destinationLabel(field)} value={formatValue(draft[field]) === "—" ? "" : formatValue(draft[field])} onChange={(value) => setDraft((current) => ({...current,[field]:value}))} />)}</div></div>}
      {toggleFields.length > 0 && <div className="destinationCard"><div className="destinationCardTitle"><b>前台设置</b><span>控制目的地是否发布、推荐及其他展示状态。</span></div><div className="destinationToggles">{toggleFields.map((field) => <label key={field}><div><b>{destinationLabel(field)}</b><small>{/featured/.test(field) ? "开启后可用于首页或推荐区域。" : "控制该内容在网站上的展示状态。"}</small></div><input type="checkbox" checked={Boolean(draft[field])} onChange={(e) => setDraft({...draft,[field]:e.target.checked})}/></label>)}</div></div>}
      <div className="destinationBottomActions"><button onClick={() => setEditing(null)}>取消</button><button className="adminPrimary" disabled={saving} onClick={save}>{saving ? "正在保存…" : "保存目的地"}</button></div>
    </>}
  </section>;

  return <section className="adminPanel destinationManager"><header><div><h2>目的地管理</h2><p>管理 SEEK CHINA TRAVEL 的目的地页面、图片和前台展示内容。</p></div><div className="destinationListActions"><button onClick={onRefresh}>↻ 刷新</button><button className="adminPrimary" onClick={() => openEditor()}>＋ 新增目的地</button></div></header>
    {(message || actionMessage) && <div className="adminEmpty error"><b>操作未完成</b><p>{message || actionMessage}</p></div>}
    {loading ? <div className="adminEmpty">正在加载目的地…</div> : rows.length === 0 ? <div className="adminEmpty"><b>还没有目的地</b><p>点击“新增目的地”创建第一条内容。</p><button onClick={() => openEditor()}>＋ 新增目的地</button></div> :
    <div className="destinationList">{rows.map((row,index) => {
      const imageKey = Object.keys(row).find(isImageField);
      const imageUrl = imageKey && typeof row[imageKey] === "string" ? String(row[imageKey]) : "";
      const desc = String(row.short_description ?? row.description ?? "");
      return <article key={String(row.id ?? index)}>{imageUrl ? <img src={imageUrl} alt="" /> : <div className="destinationThumb">{String(row.name ?? "?").slice(0,1)}</div>}<div className="destinationListBody"><div><h3>{row.slug ? <a href={"/destination?slug="+encodeURIComponent(String(row.slug))} target="_blank" rel="noopener noreferrer" title="新窗口打开前台对应页面">{String(row.name ?? "未命名目的地")} ↗</a> : String(row.name ?? "未命名目的地")}</h3><span>{String(row.region ?? row.country ?? "China")}</span></div><p>{desc || "暂未填写目的地介绍。"}</p><small>/{String(row.slug ?? "")}</small></div><div className="destinationRowActions"><button onClick={() => openEditor(row)}>编辑</button><button className="danger" onClick={() => remove(row)}>删除</button></div></article>
    })}</div>}
  </section>;
}


const tourLabels: Record<string,string> = {name:"线路英文名称",title:"线路英文名称",slug:"URL 标识",subtitle:"线路副标题",destination:"目的地",destination_id:"目的地 ID",duration:"行程天数",duration_days:"行程天数",days:"行程天数",price:"价格",price_from:"起价",original_price:"原价",currency:"币种",short_description:"线路简介（旧字段）",description:"线路介绍",content:"详细内容",highlights:"行程亮点",included:"费用包含",includes:"费用包含",excluded:"费用不含",excludes:"费用不含",hotel:"住宿说明",hotels:"住宿说明",meals:"餐食说明",hero_image_url:"线路封面",image_url:"线路封面",cover_image_url:"线路封面",important_notes:"重要提示",suitable_for:"适合人群",hotel_description:"住宿说明",meals_description:"餐食说明",transportation_description:"交通说明",is_featured:"首页推荐",featured:"首页推荐",is_published:"发布到网站",published:"发布到网站",sort_order:"显示顺序",display_order:"显示顺序"};
function tourLabel(field:string){return tourLabels[field]??field.replaceAll("_"," ");}

function TourManager({rows,loading,message,onRefresh}:{rows:RecordRow[];loading:boolean;message:string;onRefresh:()=>void}){
 const supabase=useMemo(()=>createClient(),[]);const [editing,setEditing]=useState<RecordRow|null>(null);const [draft,setDraft]=useState<RecordRow>({});const [days,setDays]=useState<RecordRow[]>([]);const [daysLoading,setDaysLoading]=useState(false);const [saving,setSaving]=useState(false);const [uploading,setUploading]=useState("");const [actionMessage,setActionMessage]=useState("");const [savedDayId,setSavedDayId]=useState<unknown>(null);
 async function loadDays(tourId:unknown){if(tourId==null){setDays([]);return;}setDaysLoading(true);const {data,error}=await supabase.from("tour_days").select("*").eq("tour_id",tourId).order("day_number",{ascending:true});if(error)setActionMessage("每日行程读取失败："+error.message);setDays((data as RecordRow[]|null)??[]);setDaysLoading(false);}
 function openEditor(row?:RecordRow){setActionMessage("");if(row){setEditing(row);setDraft({...row});loadDays(row.id);return;}const template:RecordRow={name:"",slug:"",subtitle:"",destination:"",duration_days:"",price_from:"",original_price:"",currency:"CNY",description:"",highlights:"",hero_image_url:"",included:"",excluded:"",important_notes:"",suitable_for:"",is_featured:false,is_published:false,sort_order:0};setEditing({});setDraft(template);setDays([]);}
 async function uploadImage(field:string,file?:File){if(!file)return;setUploading(field);setActionMessage("");const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="tours/"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file,{upsert:false});if(error)setActionMessage("图片上传失败："+error.message);else{const {data}=supabase.storage.from("website-media").getPublicUrl(path);setDraft(cur=>({...cur,[field]:data.publicUrl}));}setUploading("");} async function save(){setSaving(true);setActionMessage("");const normalizedDraft={...draft};if(typeof normalizedDraft.name==="string"&&normalizedDraft.name.trim())normalizedDraft.title=normalizedDraft.name;if((normalizedDraft.name==null||normalizedDraft.name==="")&&typeof normalizedDraft.title==="string")normalizedDraft.name=normalizedDraft.title;const payload=Object.fromEntries(Object.entries(normalizedDraft).filter(([k])=>!["id","created_at","updated_at"].includes(k)).map(([k,v])=>[k,v===""?null:v]));const id=editing?.id;const query=id==null?supabase.from("tours").insert(payload).select().single():supabase.from("tours").update(payload).eq("id",id).select().single();const {data,error}=await query;if(error)setActionMessage(error.message);else if(data){setEditing(data as RecordRow);setDraft(data as RecordRow);await loadDays((data as RecordRow).id);onRefresh();setActionMessage("线路已保存。");}setSaving(false);}
 async function remove(row:RecordRow){if(row.id==null||!confirm("确定删除这条旅游线路吗？此操作无法撤销。"))return;const {error}=await supabase.from("tours").delete().eq("id",row.id);if(error)setActionMessage(error.message);else onRefresh();}
 async function addDay(){if(editing?.id==null){setActionMessage("请先保存线路基本信息，再添加每日行程。");return;}setActionMessage("正在添加每日行程…");const payload:RecordRow={tour_id:editing.id,day_number:days.length+1,title:"",description:"",attractions:"",meals:"",hotel:"",transportation:"",image_url:""};const {data,error}=await supabase.from("tour_days").insert(payload).select().single();if(error){setActionMessage("添加每日行程失败："+error.message);return;}if(data){setDays(cur=>[...cur,data as RecordRow].sort((a,b)=>Number(a.day_number??0)-Number(b.day_number??0)));setActionMessage("DAY "+String((data as RecordRow).day_number??days.length+1)+" 已添加，请填写当天行程。");}else{await loadDays(editing.id);setActionMessage("每日行程已添加。");}}
 async function saveDay(day:RecordRow){if(day.id==null){setActionMessage("保存当天失败：缺少行程记录 ID，请刷新后重试。");return;}setActionMessage("正在保存 DAY "+String(day.day_number??"")+"…");const payload={title:day.title??null,description:day.description??day.content??null,meals:day.meals??null,hotel:day.hotel??null,image_url:day.image_url??null};const {data,error}=await supabase.from("tour_days").update(payload).eq("id",day.id).select().single();if(error){setActionMessage("保存当天失败："+error.message);return;}if(data){setDays(cur=>cur.map(d=>d.id===day.id?data as RecordRow:d));setSavedDayId(day.id);setActionMessage("DAY "+String((data as RecordRow).day_number??day.day_number??"")+" 已保存。");window.setTimeout(()=>setSavedDayId((current:unknown)=>current===day.id?null:current),3000);}else setActionMessage("保存当天失败：数据库没有返回更新后的记录。");}
 async function deleteDay(day:RecordRow){if(day.id==null||!confirm("确定删除这一天的行程吗？"))return;const {error}=await supabase.from("tour_days").delete().eq("id",day.id);if(error)setActionMessage(error.message);else loadDays(editing?.id);} async function uploadDayImage(day:RecordRow,file?:File){if(!file||day.id==null)return;setUploading("day-"+String(day.id));setActionMessage("");const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="tours/days/"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file,{upsert:false});if(error)setActionMessage("当天图片上传失败："+error.message);else{const {data}=supabase.storage.from("website-media").getPublicUrl(path);const {error:updateError}=await supabase.from("tour_days").update({image_url:data.publicUrl}).eq("id",day.id);if(updateError)setActionMessage(updateError.message);else{setDays(cur=>cur.map(d=>d.id===day.id?{...d,image_url:data.publicUrl}:d));setActionMessage("当天图片已上传。");}}setUploading("");}
 const fields=editing?Object.keys(draft).filter(k=>!["id","created_at","updated_at"].includes(k)):[];const imageFields=fields.filter(f=>isImageField(f)&&f!=="cover_image_url"&&f!=="gallery_images");const toggles=fields.filter(f=>["is_featured","is_published"].includes(f));const basicKeys=["name","slug","subtitle","destination","duration_days","suitable_for","sort_order"];const priceKeys=["price_from","original_price","currency"];const introKeys=["description","highlights"];const feeKeys=["included","excluded"];const serviceKeys:string[]=[];const noteKeys=["important_notes"];const basics=fields.filter(f=>basicKeys.includes(f));const prices=fields.filter(f=>priceKeys.includes(f));const intros=fields.filter(f=>introKeys.includes(f));const fees=fields.filter(f=>feeKeys.includes(f));const services=fields.filter(f=>serviceKeys.includes(f));const notes=fields.filter(f=>noteKeys.includes(f));const handled=new Set([...imageFields,...toggles,...basics,...prices,...intros,...fees,...services,...notes,"short_description","content"]);const extras=fields.filter(f=>!handled.has(f));
 if(editing)return <section className="destinationEditor tourEditor"><header className="destinationEditorHead"><div><button className="adminBack" onClick={()=>setEditing(null)}>← 返回线路列表</button><p>旅游产品编辑</p><h2>{editing.id==null?"新增旅游线路":String(draft.name??draft.title??"编辑线路")}</h2><span>按旅行社产品流程填写；面向游客的内容请填写英文。</span></div><div className="destinationEditorActions"><button onClick={()=>setEditing(null)}>返回</button><button className="adminPrimary" disabled={saving||fields.length===0} onClick={save}>{saving?"正在保存…":"保存线路"}</button></div></header>
 {actionMessage&&<div className={actionMessage.includes("已")?"tourSuccess":"adminEmpty error destinationError"}><p>{actionMessage}</p></div>}
 <div className="tourSectionNav"><span>产品录入顺序</span><b>01 基本信息</b><b>02 价格</b><b>03 图片</b><b>04 介绍亮点</b><b>05 每日行程</b><b>06 费用</b><b>07 提示</b><b>08 发布</b></div>
 <div className="destinationCard"><div className="destinationCardTitle"><b>01 · 基本信息</b><span>线路名称、URL、目的地、天数和适合人群。</span></div><div className="destinationFormGrid">{basics.map(field=><label key={field}><span>{tourLabel(field)}</span><input value={formatValue(draft[field])==="—"?"":formatValue(draft[field])} placeholder={field==="slug"?"例如：chongqing-4-days":""} onChange={e=>setDraft({...draft,[field]:e.target.value})}/></label>)}</div></div>
 {prices.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>02 · 价格与销售</b><span>设置游客看到的起价、原价和币种。</span></div><div className="destinationFormGrid">{prices.map(field=><label key={field}><span>{tourLabel(field)}</span><input value={formatValue(draft[field])==="—"?"":formatValue(draft[field])} placeholder={field==="currency"?"CNY / USD":""} onChange={e=>setDraft({...draft,[field]:e.target.value})}/></label>)}</div></div>}
 {imageFields.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>03 · 线路封面</b><span>上传线路主视觉，用于 Tours 列表和线路详情页封面。</span></div><div className="destinationImages">{imageFields.map(field=>{const url=typeof draft[field]==="string"?String(draft[field]):"";return <div className="destinationImageBox" key={field}><span>{tourLabel(field)}</span>{url?<img src={url} alt=""/>:<div className="destinationImageEmpty">暂无图片</div>}<div><label className="destinationUpload">{uploading===field?"上传中…":"上传 / 更换图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!!uploading} onChange={e=>uploadImage(field,e.target.files?.[0])}/></label>{url&&<button onClick={()=>setDraft({...draft,[field]:""})}>移除</button>}</div></div>})}</div></div>}
 {intros.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>04 · 线路介绍与亮点</b><span>填写统一的线路介绍和行程亮点；前台列表会自动截取介绍摘要。</span></div><div className="destinationLongFields">{intros.map(field=>field==="highlights"?<div className="tourHighlightsEditor" key={field}><span>行程亮点</span>{String(draft.highlights??"").split("\n").filter(Boolean).map((item,index)=>{const items=String(draft.highlights??"").split("\n").filter(Boolean);return <div className="tourHighlightRow" key={index}><b>{String(index+1).padStart(2,"0")}</b><input value={item} onChange={e=>{const next=[...items];next[index]=e.target.value;setDraft({...draft,highlights:next.join("\n")})}}/><button type="button" onClick={()=>setDraft({...draft,highlights:items.filter((_,i)=>i!==index).join("\n")})}>删除</button></div>})}<button type="button" className="tourAddHighlight" onClick={()=>{const items=String(draft.highlights??"").split("\n").filter(Boolean);setDraft({...draft,highlights:[...items,"New highlight"].join("\n")})}}>＋ 添加一条亮点</button><small>每条亮点会在前台 Trip highlights 独立显示。</small></div>:<RichTextEditor key={field} label={tourLabel(field)} value={formatValue(draft[field])==="—"?"":formatValue(draft[field])} onChange={value=>setDraft(cur=>({...cur,[field]:value}))}/>)}</div></div>}
 <div className="destinationCard"><div className="destinationCardTitle tourDayTitle"><div><b>05 · 每日行程</b><span>管理 Day 1、Day 2、Day 3…；当天图片可直接上传。</span></div><button onClick={addDay}>＋ 添加一天</button></div>{editing.id==null?<div className="tourDayEmpty">请先保存线路基本信息，然后即可添加每日行程。</div>:daysLoading?<div className="tourDayEmpty">正在读取每日行程…</div>:days.length===0?<div className="tourDayEmpty">还没有每日行程，点击“添加一天”开始。</div>:<div className="tourDays">{days.map((day,index)=><div className="tourDayCard" key={String(day.id??index)}><div className="tourDayNumber">DAY <b>{String(day.day_number??index+1).padStart(2,"0")}</b></div><div className="tourDayFields"><label><span>当天标题</span><input value={String(day.title??"")} onChange={e=>setDays(cur=>cur.map(d=>d.id===day.id?{...d,title:e.target.value}:d))}/></label><label><span>行程内容</span><textarea rows={4} value={String(day.description??day.content??"")} onChange={e=>setDays(cur=>cur.map(d=>d.id===day.id?{...d,description:e.target.value}:d))}/></label><label><span>餐食</span><input value={String(day.meals??"")} placeholder="例如：Breakfast / Lunch / Dinner" onChange={e=>setDays(cur=>cur.map(d=>d.id===day.id?{...d,meals:e.target.value}:d))}/></label><label><span>住宿</span><input value={String(day.hotel??"")} placeholder="例如：4-star hotel in Chongqing" onChange={e=>setDays(cur=>cur.map(d=>d.id===day.id?{...d,hotel:e.target.value}:d))}/></label><div className="tourDayImage"><span>当天图片</span>{day.image_url?<img src={String(day.image_url)} alt=""/>:<div>暂无图片</div>}<label>{uploading==="day-"+String(day.id)?"上传中…":"上传 / 更换当天图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!!uploading} onChange={e=>uploadDayImage(day,e.target.files?.[0])}/></label></div></div><div className="tourDayActions"><button onClick={()=>saveDay(day)}>保存当天</button>{savedDayId===day.id&&<strong className="tourDaySaved">✓ 保存成功</strong>}<button className="danger" onClick={()=>deleteDay(day)}>删除</button></div></div>)}</div>}</div>
 {fees.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>06 · 费用说明</b><span>只维护前台会展示的费用包含与费用不含。</span></div><div className="destinationLongFields">{fees.map(field=><RichTextEditor key={field} label={tourLabel(field)} value={formatValue(draft[field])==="—"?"":formatValue(draft[field])} onChange={value=>setDraft(cur=>({...cur,[field]:value}))}/>)}</div></div>}
 
 {notes.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>07 · 重要提示</b><span>填写预订、年龄、证件、天气或其他需要游客提前知道的事项。</span></div>{notes.map(field=><RichTextEditor key={field} label={tourLabel(field)} value={formatValue(draft[field])==="—"?"":formatValue(draft[field])} onChange={value=>setDraft(cur=>({...cur,[field]:value}))}/>)}</div>}
 
 {toggles.length>0&&<div className="destinationCard"><div className="destinationCardTitle"><b>08 · 发布设置</b><span>确认内容完成后再发布到网站或设为首页推荐。</span></div><div className="destinationToggles">{toggles.map(field=><label key={field}><div><b>{tourLabel(field)}</b><small>{/featured/.test(field)?"开启后可用于首页推荐区域。":"开启后允许前台展示该线路。"}</small></div><input type="checkbox" checked={Boolean(draft[field])} onChange={e=>setDraft({...draft,[field]:e.target.checked})}/></label>)}</div></div>}
 <div className="destinationBottomActions"><button onClick={()=>setEditing(null)}>返回列表</button><button className="adminPrimary" disabled={saving} onClick={save}>{saving?"正在保存…":"保存全部线路信息"}</button></div></section>;
 return <section className="adminPanel destinationManager"><header><div><h2>旅游线路</h2><p>管理线路产品、价格、图片、每日行程与前台发布状态。</p></div><div className="destinationListActions"><button onClick={onRefresh}>↻ 刷新</button><button className="adminPrimary" onClick={()=>openEditor()}>＋ 新增线路</button></div></header>{(message||actionMessage)&&<div className="adminEmpty error"><p>{message||actionMessage}</p></div>}{loading?<div className="adminEmpty">正在加载旅游线路…</div>:rows.length===0?<div className="adminEmpty"><b>还没有旅游线路</b><p>点击“新增线路”创建第一个产品。</p></div>:<div className="destinationList tourList">{rows.map((row,index)=>{const ik=Object.keys(row).find(isImageField);const img=ik&&typeof row[ik]==="string"?String(row[ik]):"";const duration=row.duration_days??row.duration??row.days;const price=row.price_from??row.price;return <article key={String(row.id??index)}>{img?<img src={img} alt=""/>:<div className="destinationThumb">旅</div>}<div className="destinationListBody"><div><h3>{row.slug ? <a href={"/tour?slug="+encodeURIComponent(String(row.slug))} target="_blank" rel="noopener noreferrer" title="新窗口打开前台线路详情">{String(row.name??row.title??"未命名线路")} ↗</a> : String(row.name??row.title??"未命名线路")}</h3><span>{duration?String(duration)+" Days":"行程天数待定"}</span></div><p>{String(row.short_description??row.description??"暂未填写线路简介。")}</p><small>{price?String(row.currency??"CNY")+" "+String(price):"价格待定"}</small></div><div className="destinationRowActions"><button onClick={()=>openEditor(row)}>编辑</button><button className="danger" onClick={()=>remove(row)}>删除</button></div></article>})}</div>}</section>;
}

function HeroManager({rows,onRefresh}:{rows:RecordRow[];onRefresh:()=>void}){const supabase=useMemo(()=>createClient(),[]);const [page,setPage]=useState("home");const [draft,setDraft]=useState<RecordRow>({});const [saving,setSaving]=useState(false);const [msg,setMsg]=useState("");const defaults:Record<string,RecordRow>={home:{eyebrow:"DISCOVER CHINA. YOUR WAY.",title:"Explore Real China",subtitle:"Tailor-made China journeys designed around your pace, interests and travel style.",image:"",overlay:48,button_text:"Plan My Trip",button_link:"/quote"},tours:{eyebrow:"CURATED PRIVATE JOURNEYS",title:"See China differently.",subtitle:"Thoughtfully designed journeys, local expertise and the freedom to make every trip your own.",image:"/images/china-hero.jpg",overlay:48,button_text:"",button_link:""},destinations:{eyebrow:"EXPLORE CHINA",title:"Destinations",subtitle:"From ancient capitals to dramatic mountains, discover a China that matches your travel style.",image:"",overlay:48,button_text:"",button_link:""},"travel-guide":{eyebrow:"CHINA TRAVEL GUIDE",title:"Know before you go.",subtitle:"Practical advice and local insight to make traveling in China simpler, smoother and more rewarding.",image:"",overlay:48,button_text:"",button_link:""},about:{eyebrow:"ABOUT SEEK CHINA TRAVEL",title:"China, made personal.",subtitle:"Private and tailor-made China journeys created with local knowledge and thoughtful planning.",image:"",overlay:48,button_text:"",button_link:""},quote:{eyebrow:"TAILOR-MADE CHINA",title:"Plan Your China Trip",subtitle:"Share your ideas with us and start building a China journey around you.",image:"",overlay:52,button_text:"",button_link:""}};useEffect(()=>{const row=rows.find(r=>r.section_key==="hero:"+page);let cfg={...defaults[page]};if(row){try{cfg={...cfg,...(typeof row.content==="string"?JSON.parse(row.content):row.content as RecordRow),image:String((typeof row.content==="object"&&(row.content as RecordRow)?.image)||row.image_url||cfg.image)}}catch{}}setDraft(cfg);setMsg("");},[page,rows]);async function upload(file?:File){if(!file)return;setMsg("图片上传中…");const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="heroes/"+page+"-"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file);if(error){setMsg(error.message);return;}const {data}=supabase.storage.from("website-media").getPublicUrl(path);setDraft(d=>({...d,image:data.publicUrl}));setMsg("图片已上传，请点击保存 Hero。");}async function save(){setSaving(true);setMsg("");const existing=rows.find(r=>r.section_key==="hero:"+page);const pageName=heroPages.find(([key])=>key===page)?.[1]??page;const payload={section_key:"hero:"+page,section_name:pageName+" Hero",title:String(draft.title??""),content:JSON.stringify(draft),image_url:String(draft.image??""),is_active:true};const q=existing?.id!=null?supabase.from("homepage_sections").update(payload).eq("id",existing.id):supabase.from("homepage_sections").insert(payload);const {error}=await q;if(error)setMsg(error.message);else{setMsg("Hero 已保存并同步到前台。");onRefresh();}setSaving(false);}return <section className="adminPanel heroAdmin"><header><div><h2>页面 Hero 管理</h2><p>统一管理各栏目顶部大图、英文标题和遮罩。以后新增栏目也沿用这一套。</p></div></header><div className="heroAdminTabs">{heroPages.map(([k,n])=><button className={page===k?"active":""} onClick={()=>setPage(k)} key={k}>{n}</button>)}</div><div className="destinationCard"><div className="destinationCardTitle"><b>Hero 内容与图片</b><span>前台显示英文；后台在这里统一修改。</span></div><div className="heroAdminPreview" style={draft.image?{backgroundImage:"url('"+String(draft.image)+"')"}:undefined}><div style={{background:"rgba(4,31,52,"+(Number(draft.overlay??48)/100)+")"}}><small>{String(draft.eyebrow??"")}</small><b>{String(draft.title??"")}</b><p>{String(draft.subtitle??"")}</p></div></div><div className="destinationFormGrid"><label><span>Eyebrow 小标题</span><input value={String(draft.eyebrow??"")} onChange={e=>setDraft({...draft,eyebrow:e.target.value})}/></label><label><span>主标题</span><input value={String(draft.title??"")} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label style={{gridColumn:"1/-1"}}><span>副标题 / 简介</span><textarea rows={3} value={String(draft.subtitle??"")} onChange={e=>setDraft({...draft,subtitle:e.target.value})}/></label><label><span>遮罩深浅（0–90）</span><input type="number" min="0" max="90" value={String(draft.overlay??48)} onChange={e=>setDraft({...draft,overlay:Number(e.target.value)})}/></label><label><span>按钮文字（可选）</span><input value={String(draft.button_text??"")} onChange={e=>setDraft({...draft,button_text:e.target.value})}/></label><label><span>按钮链接（可选）</span><input value={String(draft.button_link??"")} onChange={e=>setDraft({...draft,button_link:e.target.value})}/></label><label><span>Hero 图片</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>upload(e.target.files?.[0])}/></label></div>{msg&&<p className="tourSuccess">{msg}</p>}<button className="adminPrimary" disabled={saving} onClick={save}>{saving?"正在保存…":"保存 Hero"}</button></div></section>}


function InquiryManager({rows,loading,message,onRefresh}:{rows:RecordRow[];loading:boolean;message:string;onRefresh:()=>void}){
 const supabase=useMemo(()=>createClient(),[]);const [busy,setBusy]=useState<unknown>(null);const [notice,setNotice]=useState("");
 async function setStatus(row:RecordRow,status:string){if(row.id==null)return;setBusy(row.id);setNotice("");const {error}=await supabase.from("inquiries").update({status}).eq("id",row.id);setBusy(null);if(error)setNotice("更新失败："+error.message);else onRefresh();}
 const ordered=[...rows].sort((a,b)=>String(b.created_at??"").localeCompare(String(a.created_at??"")));
 return <section className="adminPanel inquiryManager"><header><div><h2>客户咨询</h2><p>查看官网旅行询盘、联系方式与需求，并跟进处理状态。</p></div><button onClick={onRefresh}>↻ 刷新</button></header>
 {(message||notice)&&<div className="adminEmpty error"><p>{message||notice}</p></div>}
 {loading?<div className="adminEmpty">正在加载客户咨询…</div>:ordered.length===0?<div className="adminEmpty"><b>暂无客户咨询</b><p>官网提交的新询盘会显示在这里。</p></div>:<div className="inquiryList">{ordered.map((row,index)=>{const status=String(row.status??"new");return <article className="inquiryCard" key={String(row.id??index)}><div className="inquiryTop"><div><span className={"inquiryStatus "+status}>{status==="new"?"新询盘":status==="contacted"?"已联系":status==="closed"?"已完成":status}</span><h3>{String(row.full_name??"未填写姓名")}</h3><small>{row.created_at?new Date(String(row.created_at)).toLocaleString("zh-CN"):""}</small></div><select value={status} disabled={busy===row.id} onChange={e=>setStatus(row,e.target.value)}><option value="new">新询盘</option><option value="contacted">已联系</option><option value="closed">已完成</option></select></div><div className="inquiryContact"><span><b>邮箱</b>{String(row.email??"—")}</span><span><b>电话</b>{String(row.phone??"—")}</span><span><b>WhatsApp</b>{String(row.whatsapp??"—")}</span><span><b>来源</b>{String(row.source??"—")}</span></div>{Boolean(row.destination)&&<div className="inquiryDestination"><b>咨询行程</b><p>{String(row.destination)}</p></div>}<div className="inquiryMessage"><b>客户需求</b><p>{String(row.message??"—")}</p></div></article>})}</div>}
 </section>
}

function Collection({ table, title, rows, loading, message, onRefresh }: { table: TableName; title: string; rows: RecordRow[]; loading: boolean; message: string; onRefresh: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [draft, setDraft] = useState<RecordRow>({});
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const columns = rows.length ? Object.keys(rows[0]).slice(0, 7) : [];
  const canEdit = editableTables.has(table);

  function openEditor(row?: RecordRow) {
    setActionMessage("");
    if (row) {
      setEditing(row);
      setDraft({ ...row });
      return;
    }
    const template = rows[0]
      ? Object.fromEntries(
          Object.entries(rows[0])
            .filter(([key]) => !["id", "created_at", "updated_at"].includes(key))
            .map(([key, value]) => [key, typeof value === "boolean" ? false : ""])
        )
      : {};
    setEditing({});
    setDraft(template);
  }

  async function save() {
    setSaving(true); setActionMessage("");
    const payload = Object.fromEntries(Object.entries(draft).filter(([key]) => !["id", "created_at", "updated_at"].includes(key)));
    const id = editing?.id;
    const query = id == null ? supabase.from(table).insert(payload) : supabase.from(table).update(payload).eq("id", id);
    const { error } = await query;
    if (error) setActionMessage(error.message); else { setEditing(null); onRefresh(); }
    setSaving(false);
  }

  async function remove(row: RecordRow) {
    if (row.id == null || !confirm("确定删除这条记录吗？此操作无法撤销。")) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) setActionMessage(error.message); else onRefresh();
  }

  const fields = editing ? Object.keys(draft).filter((key) => !["id", "created_at", "updated_at"].includes(key)) : [];
  return <section className="adminPanel"><header><div><h2>{title}</h2><p>{canEdit ? "可直接新增、编辑和删除 Supabase 数据库内容。" : "实时读取 Supabase 数据库记录。"}</p></div><div style={{display:"flex",gap:8}}>{canEdit && <button onClick={() => openEditor()}>＋ 新增</button>}<button onClick={onRefresh}>↻ 刷新</button></div></header>
    {(message || actionMessage) && <div className="adminEmpty error"><b>操作未完成</b><p>{message || actionMessage}</p><small>请检查该账号的 Supabase RLS 写入权限。</small></div>}
    {editing && <div className="mediaUpload" style={{display:"block"}}><div style={{marginBottom:16}}><b>{editing.id == null ? "新增内容" : "编辑内容"}</b><p>后台字段为中文操作界面；面向游客的内容请继续填写英文。</p></div>
      {fields.length === 0 ? <p>暂时无法读取字段结构，请先刷新页面后重试。</p> : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>{fields.map((field) => {
        const value = draft[field]; const isBool = typeof value === "boolean"; const isLong = typeof value === "string" && (value.length > 80 || /description|content|summary|subtitle/i.test(field));
        return <label key={field} style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>{field.replaceAll("_"," ")}
          {isBool ? <select value={String(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value === "true"})}><option value="true">是</option><option value="false">否</option></select> : isLong ? <textarea rows={4} value={formatValue(value) === "—" ? "" : formatValue(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value})} /> : <input value={formatValue(value) === "—" ? "" : formatValue(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value})} />}
        </label>})}</div>}
      <div style={{display:"flex",gap:10,marginTop:18}}><button className="adminPrimary" disabled={saving || fields.length === 0} onClick={save}>{saving ? "正在保存…" : "保存"}</button><button onClick={() => setEditing(null)}>取消</button></div>
    </div>}
    {loading ? <div className="adminEmpty">正在加载数据…</div> : rows.length === 0 ? <div className="adminEmpty"><b>暂无数据</b><p>当前没有可显示的数据。</p>{canEdit && <button onClick={() => openEditor()}>新增第一条内容</button>}</div> : <div className="adminTableWrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}{canEdit && <th>操作</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column} title={formatValue(row[column])}>{formatValue(row[column])}</td>)}{canEdit && <td><div style={{display:"flex",gap:8}}><button onClick={() => openEditor(row)}>编辑</button><button onClick={() => remove(row)}>删除</button></div></td>}</tr>)}</tbody></table></div>}
  </section>;
}


function GuideManager({rows,loading,message,onRefresh}:{rows:RecordRow[];loading:boolean;message:string;onRefresh:()=>void}){const supabase=useMemo(()=>createClient(),[]);const [editing,setEditing]=useState<RecordRow|null>(null);const [draft,setDraft]=useState<RecordRow>({});const [saving,setSaving]=useState(false);const [uploading,setUploading]=useState(false);const [msg,setMsg]=useState("");
 function open(row?:RecordRow){setMsg("");if(row){setEditing(row);setDraft({...row});return;}const template:RecordRow=rows[0]?Object.fromEntries(Object.entries(rows[0]).filter(([k])=>!["id","created_at","updated_at"].includes(k)).map(([k,v])=>[k,typeof v==="boolean"?false:""])):{title:"",slug:"",category:"",summary:"",content:"",hero_image_url:"",is_published:false};setEditing({});setDraft(template);}
 async function upload(file?:File){if(!file)return;setUploading(true);const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path="travel-guides/"+Date.now()+"-"+safe;const {error}=await supabase.storage.from("website-media").upload(path,file);if(error)setMsg(error.message);else{const {data}=supabase.storage.from("website-media").getPublicUrl(path);setDraft(d=>({...d,hero_image_url:data.publicUrl}));}setUploading(false);}
 async function save(){setSaving(true);setMsg("");const payload=Object.fromEntries(Object.entries(draft).filter(([k])=>!["id","created_at","updated_at"].includes(k)).map(([k,v])=>[k,v===""?null:v]));const q=editing?.id==null?supabase.from("travel_guides").insert(payload):supabase.from("travel_guides").update(payload).eq("id",editing.id);const {error}=await q;if(error)setMsg(error.message);else{setEditing(null);onRefresh();}setSaving(false);}
 async function remove(row:RecordRow){if(row.id==null||!confirm("确定删除这篇旅行攻略吗？"))return;const {error}=await supabase.from("travel_guides").delete().eq("id",row.id);if(error)setMsg(error.message);else onRefresh();}
 const fields=editing?Object.keys(draft).filter(k=>!["id","created_at","updated_at"].includes(k)):[];const imageField=fields.find(k=>["hero_image_url","image_url","cover_image_url"].includes(k));const titleKey=fields.includes("title")?"title":fields.includes("name")?"name":"";const summaryKey=fields.find(k=>["summary","short_description","subtitle"].includes(k));const contentKey=fields.find(k=>["content","description"].includes(k));const hidden=new Set([imageField,titleKey,summaryKey,contentKey].filter(Boolean));const other=fields.filter(k=>!hidden.has(k));
 if(editing)return <section className="destinationEditor"><header className="destinationEditorHead"><div><button className="adminBack" onClick={()=>setEditing(null)}>← 返回攻略列表</button><p>旅行攻略编辑</p><h2>{editing.id==null?"新增旅行攻略":String(draft[titleKey]??"编辑攻略")}</h2><span>面向游客的标题和正文请填写英文。</span></div><div className="destinationEditorActions"><button onClick={()=>setEditing(null)}>取消</button><button className="adminPrimary" disabled={saving} onClick={save}>{saving?"正在保存…":"保存攻略"}</button></div></header>{msg&&<div className="adminEmpty error"><p>{msg}</p></div>}
 <div className="destinationCard"><div className="destinationCardTitle"><b>01 · 基本信息</b><span>标题、URL、分类和发布状态。</span></div><div className="destinationFormGrid">{titleKey&&<label><span>攻略英文标题</span><input value={String(draft[titleKey]??"")} onChange={e=>setDraft({...draft,[titleKey]:e.target.value})}/></label>}{other.map(k=>{const bool=typeof draft[k]==="boolean";return <label key={k}><span>{k==="slug"?"URL 标识":k==="category"?"攻略分类":k==="is_published"?"发布到网站":k.replaceAll("_"," ")}</span>{bool?<input type="checkbox" checked={Boolean(draft[k])} onChange={e=>setDraft({...draft,[k]:e.target.checked})}/>:<input value={String(draft[k]??"")} onChange={e=>setDraft({...draft,[k]:e.target.value})}/>}</label>})}</div></div>
 <div className="destinationCard"><div className="destinationCardTitle"><b>02 · 攻略主图</b><span>用于攻略列表卡片和详情页顶部 Banner。</span></div>{imageField&&<div className="destinationImageBox">{draft[imageField]?<img src={String(draft[imageField])} alt=""/>:<div className="destinationImageEmpty">暂无图片</div>}<label className="destinationUpload">{uploading?"上传中…":"上传 / 更换图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>upload(e.target.files?.[0])}/></label></div>}</div>
 {summaryKey&&<div className="destinationCard"><div className="destinationCardTitle"><b>03 · 简短介绍</b><span>用于攻略列表摘要和详情页标题下方。</span></div><textarea rows={4} value={String(draft[summaryKey]??"")} onChange={e=>setDraft({...draft,[summaryKey]:e.target.value})}/></div>}
 {contentKey&&<div className="destinationCard"><div className="destinationCardTitle"><b>04 · 攻略正文</b><span>支持标题、列表、链接和正文图片。</span></div><RichTextEditor label="攻略正文" value={String(draft[contentKey]??"")} onChange={v=>setDraft(d=>({...d,[contentKey]:v}))}/></div>}
 </section>;
 return <section className="adminPanel destinationManager"><header><div><h2>旅行攻略</h2><p>管理面向国际游客的中国旅行实用内容。</p></div><div className="destinationListActions"><button onClick={onRefresh}>↻ 刷新</button><button className="adminPrimary" onClick={()=>open()}>＋ 新增攻略</button></div></header>{(message||msg)&&<div className="adminEmpty error"><p>{message||msg}</p></div>}{loading?<div className="adminEmpty">正在加载旅行攻略…</div>:rows.length===0?<div className="adminEmpty"><b>还没有旅行攻略</b><p>点击“新增攻略”创建第一篇内容。</p></div>:<div className="destinationList">{rows.map((r,i)=><article key={String(r.id??i)}><div className="destinationThumb">文</div><div className="destinationListBody"><div><h3>{r.slug?<a href={"/guide?slug="+encodeURIComponent(String(r.slug))} target="_blank" rel="noopener noreferrer">{String(r.title??r.name??"未命名攻略")} ↗</a>:String(r.title??r.name??"未命名攻略")}</h3><span>{String(r.category??"Travel Guide")}</span></div><p>{String(r.summary??r.short_description??"")}</p></div><div className="destinationRowActions"><button onClick={()=>open(r)}>编辑</button><button className="danger" onClick={()=>remove(r)}>删除</button></div></article>)}</div>}</section>;}

function MediaLibrary() {
  const supabase = useMemo(() => createClient(), []);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload() {
    if (!file) return;
    setBusy(true); setMessage("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = Date.now() + "-" + safeName;
    const { error } = await supabase.storage.from("website-media").upload(path, file, { upsert: false });
    if (error) setMessage(error.message);
    else {
      const { data } = supabase.storage.from("website-media").getPublicUrl(path);
      setMessage("上传成功：" + data.publicUrl);
      setFile(null);
    }
    setBusy(false);
  }

  return <section className="adminPanel">
    <header><div><h2>媒体库</h2><p>上传网站图片到 Supabase Storage 的 website-media 存储桶。</p></div></header>
    <div className="mediaUpload" style={{display:"block"}}>
      <label style={{display:"grid",gap:8,fontWeight:700}}>选择图片
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {file && <p>已选择：{file.name}</p>}
      <button className="adminPrimary" disabled={!file || busy} onClick={upload}>{busy ? "正在上传…" : "上传图片"}</button>
      {message && <p style={{marginTop:12,wordBreak:"break-all"}}>{message}</p>}
    </div>
  </section>;
}

