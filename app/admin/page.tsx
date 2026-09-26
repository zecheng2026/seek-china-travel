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
      <nav aria-label="Admin navigation">{sections.map(([label, key]) => <button className={active === key ? "active" : ""} key={key} onClick={() => setActive(key)}><span>{navIcon(key)}</span>{label}</button>)}</nav>
      <div className="adminAccount"><small>当前登录</small><span title={session.user.email}>{session.user.email}</span><button onClick={() => supabase.auth.signOut()}>退出登录</button></div>
    </aside>
    <section className="adminWorkspace">
      <header className="adminHeader"><div><p>SEEK CHINA TRAVEL</p><h1>{title}</h1></div><span className="adminStatus"><i /> 数据库已连接</span></header>
      {active === "dashboard" ? <控制台 onNavigate={setActive} /> : active === "media" ? <MediaLibrary /> : <Collection title={title} rows={rows} loading={loading} message={message} onRefresh={() => loadTable(active)} />}
    </section>
  </main>;
}

function Login() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, set密码] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWith密码({ email, password });
    if (error) setMessage(error.message);
    setBusy(false);
  }
  return <main className="adminGate"><form className="adminLogin" onSubmit={submit}>
    <div className="adminLoginBrand"><b>S<span>C</span>T</b><div>SEEK CHINA<small>网站管理系统</small></div></div>
    <p className="adminKicker">SECURE 管理后台</p><h1>欢迎回来</h1><p>登录后管理 SEEK CHINA TRAVEL 网站。</p>
    <label>邮箱<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@seekchinatravel.com" /></label>
    <label>密码<input required type="password" value={password} onChange={(e) => set密码(e.target.value)} autoComplete="current-password" placeholder="••••••••" /></label>
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

function Collection({ title, rows, loading, message, onRefresh }: { title: string; rows: RecordRow[]; loading: boolean; message: string; onRefresh: () => void }) {
  const columns = rows.length ? Object.keys(rows[0]).slice(0, 6) : [];
  return <section className="adminPanel"><header><div><h2>{title}</h2><p>实时读取 Supabase 数据库记录。</p></div><button onClick={onRefresh}>↻ 刷新</button></header>
    {message ? <div className="adminEmpty error"><b>无法加载此模块</b><p>{message}</p><small>请检查该账号在 Supabase 中的 RLS 权限。</small></div> : loading ? <div className="adminEmpty">正在加载数据…</div> : rows.length === 0 ? <div className="adminEmpty"><b>暂无数据</b><p>当前没有可显示的数据，或 RLS 权限尚未开放。</p></div> : <div className="adminTableWrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column} title={formatValue(row[column])}>{formatValue(row[column])}</td>)}</tr>)}</tbody></table></div>}
  </section>;
}

function MediaLibrary() {
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const input = event.currentTarget.elements.namedItem("file") as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    setUploading(true); setResult("");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("website-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) setResult(`Error: ${error.message}`); else setResult(supabase.storage.from("website-media").getPublicUrl(path).data.publicUrl);
    setUploading(false);
  }
  return <section className="adminPanel"><header><div><h2>媒体库</h2><p>上传网站图片到 <code>website-media</code> 存储桶。</p></div></header><form className="mediaUpload" onSubmit={upload}><div><b>上传网站图片</b><p>支持 JPG、PNG、WebP、AVIF，上传权限由 Storage 安全策略控制。</p></div><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><button className="adminPrimary" disabled={uploading}>{uploading ? "正在上传…" : "上传图片"}</button></form>{result && <div className={result.startsWith("Error:") ? "mediaResult error" : "mediaResult"}><b>{result.startsWith("Error:") ? "上传失败" : "图片地址已生成"}</b><p>{result}</p>{!result.startsWith("Error:") && <button onClick={() => navigator.clipboard.writeText(result)}>复制图片地址</button>}</div>}</section>;
}

function navIcon(key: string) {
  const icons: Record<string, string> = { dashboard: "⌂", site_settings: "⚙", homepage_sections: "◇", destinations: "⌖", tours: "✈", travel_guides: "▤", media: "▧", inquiries: "✉", customers: "♙", bookings: "✓" };
  return icons[key] ?? "•";
}
