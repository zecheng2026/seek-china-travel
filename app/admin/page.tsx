"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
      {active === "dashboard" ? <控制台 onNavigate={setActive} /> : active === "media" ? <MediaLibrary /> : <Collection table={active} title={title} rows={rows} loading={loading} message={message} onRefresh={() => loadTable(active)} />}
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
    setEditing(row ?? {});
    setDraft(row ? { ...row } : {});
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

  const fields = editing ? Object.keys(editing).filter((key) => !["id", "created_at", "updated_at"].includes(key)) : [];
  return <section className="adminPanel"><header><div><h2>{title}</h2><p>{canEdit ? "可直接新增、编辑和删除 Supabase 数据库内容。" : "实时读取 Supabase 数据库记录。"}</p></div><div style={{display:"flex",gap:8}}>{canEdit && <button onClick={() => openEditor()}>＋ 新增</button>}<button onClick={onRefresh}>↻ 刷新</button></div></header>
    {(message || actionMessage) && <div className="adminEmpty error"><b>操作未完成</b><p>{message || actionMessage}</p><small>请检查该账号的 Supabase RLS 写入权限。</small></div>}
    {editing && <div className="mediaUpload" style={{display:"block"}}><div style={{marginBottom:16}}><b>{editing.id == null ? "新增内容" : "编辑内容"}</b><p>后台字段为中文操作界面；面向游客的内容请继续填写英文。</p></div>
      {fields.length === 0 ? <p>此表暂无现有记录可推断字段。请先在 Supabase 建立首条记录，之后即可在这里编辑。</p> : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>{fields.map((field) => {
        const value = draft[field]; const isBool = typeof value === "boolean"; const isLong = typeof value === "string" && (value.length > 80 || /description|content|summary|subtitle/i.test(field));
        return <label key={field} style={{display:"grid",gap:6,fontSize:13,fontWeight:700}}>{field.replaceAll("_"," ")}
          {isBool ? <select value={String(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value === "true"})}><option value="true">是</option><option value="false">否</option></select> : isLong ? <textarea rows={4} value={formatValue(value) === "—" ? "" : formatValue(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value})} /> : <input value={formatValue(value) === "—" ? "" : formatValue(value)} onChange={(e) => setDraft({...draft,[field]:e.target.value})} />}
        </label>})}</div>}
      <div style={{display:"flex",gap:10,marginTop:18}}><button className="adminPrimary" disabled={saving || fields.length === 0} onClick={save}>{saving ? "正在保存…" : "保存"}</button><button onClick={() => setEditing(null)}>取消</button></div>
    </div>}
    {loading ? <div className="adminEmpty">正在加载数据…</div> : rows.length === 0 ? <div className="adminEmpty"><b>暂无数据</b><p>当前没有可显示的数据。</p>{canEdit && <button onClick={() => openEditor()}>新增第一条内容</button>}</div> : <div className="adminTableWrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}{canEdit && <th>操作</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column} title={formatValue(row[column])}>{formatValue(row[column])}</td>)}{canEdit && <td><div style={{display:"flex",gap:8}}><button onClick={() => openEditor(row)}>编辑</button><button onClick={() => remove(row)}>删除</button></div></td>}</tr>)}</tbody></table></div>}
  </section>;
}

