"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/client";

const sections = [
  ["控制台", "dashboard"],
  ["网站设置", "site_settings"],
  ["首页管理", "homepage_sections"],
  ["目的地管理", "destinations"],
  ["旅游线路", "tours"],
  ["旅行攻略", "travel_guides"],
  ["媒体库", "media"],
  ["客户咨询", "inquiries"],
  ["客户管理", "customers"],
  ["订单管理", "bookings"],
] as const;

type TableName = Exclude<(typeof sections)[number][1], "dashboard" | "media">;
type RecordRow = Record<string, unknown>;

const editableTables = new Set(["site_settings", "homepage_sections", "destinations", "tours", "travel_guides"]);
function navIcon(key: string) {
  const icons: Record<string, string> = {
    dashboard: "⌂", site_settings: "⚙", homepage_sections: "◇", destinations: "✦",
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
    if (session && active !== "dashboard" && active !== "media") loadTable(active);
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
      {active === "dashboard" ? <控制台 onNavigate={setActive} /> : active === "media" ? <MediaLibrary /> : active === "destinations" ? <DestinationManager rows={rows} loading={loading} message={message} onRefresh={() => loadTable("destinations")} /> : <Collection table={active} title={title} rows={rows} loading={loading} message={message} onRefresh={() => loadTable(active)} />}
    </section>
  </main>;
}

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
  hero_image_url: "封面 / Banner 图片", image_url: "封面图片", cover_image_url: "封面图片",
  featured_image_url: "推荐图片", is_featured: "首页推荐", featured: "首页推荐",
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
  const imageFields = fields.filter(isImageField);
  const toggleFields = fields.filter((field) => typeof draft[field] === "boolean" || /^(is_|featured$|published$)/.test(field));
  const textFields = fields.filter((field) => !imageFields.includes(field) && !toggleFields.includes(field));
  const primaryFields = textFields.filter((field) => !isLongField(field,draft[field]));
  const longFields = textFields.filter((field) => isLongField(field,draft[field]));

  if (editing) return <section className="destinationEditor">
    <header className="destinationEditorHead"><div><button className="adminBack" onClick={() => setEditing(null)}>← 返回目的地列表</button><p>目的地内容编辑</p><h2>{editing.id == null ? "新增目的地" : String(draft.name || "编辑目的地")}</h2><span>后台使用中文操作；游客看到的名称和介绍请填写英文。</span></div><div className="destinationEditorActions"><button onClick={() => setEditing(null)}>取消</button><button className="adminPrimary" disabled={saving || fields.length === 0} onClick={save}>{saving ? "正在保存…" : "保存目的地"}</button></div></header>
    {actionMessage && <div className="adminEmpty error destinationError"><b>操作未完成</b><p>{actionMessage}</p></div>}
    {fields.length === 0 ? <div className="destinationCard"><p>暂时无法读取字段结构，请返回列表刷新后重试。</p></div> : <>
      <div className="destinationCard"><div className="destinationCardTitle"><b>基本信息</b><span>用于前台页面标题、链接和目的地分类。</span></div><div className="destinationFormGrid">
        {primaryFields.map((field) => <label key={field}><span>{destinationLabel(field)}</span><input value={formatValue(draft[field]) === "—" ? "" : formatValue(draft[field])} placeholder={field === "slug" ? "例如：chongqing" : ""} onChange={(e) => setDraft({...draft,[field]:e.target.value})}/>{field === "slug" && <small>建议只使用小写英文和短横线，例如 zhangjiajie。</small>}</label>)}
      </div></div>
      {imageFields.length > 0 && <div className="destinationCard"><div className="destinationCardTitle"><b>图片管理</b><span>直接上传目的地封面、Banner 或推荐图片。</span></div><div className="destinationImages">{imageFields.map((field) => {
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
      return <article key={String(row.id ?? index)}>{imageUrl ? <img src={imageUrl} alt="" /> : <div className="destinationThumb">{String(row.name ?? "?").slice(0,1)}</div>}<div className="destinationListBody"><div><h3>{String(row.name ?? "未命名目的地")}</h3><span>{String(row.region ?? row.country ?? "China")}</span></div><p>{desc || "暂未填写目的地介绍。"}</p><small>/{String(row.slug ?? "")}</small></div><div className="destinationRowActions"><button onClick={() => openEditor(row)}>编辑</button><button className="danger" onClick={() => remove(row)}>删除</button></div></article>
    })}</div>}
  </section>;
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

