"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/client";

const sections = [
  ["Dashboard", "dashboard"],
  ["Website Settings", "site_settings"],
  ["Homepage", "homepage_sections"],
  ["Destinations", "destinations"],
  ["Tours", "tours"],
  ["Travel Guides", "travel_guides"],
  ["Media Library", "media"],
  ["Inquiries", "inquiries"],
  ["Customers", "customers"],
  ["Bookings", "bookings"],
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

  if (checking) return <main className="adminGate"><div className="adminLogin"><b className="adminLogo">SCT</b><p>Checking your secure session…</p></div></main>;
  if (!session) return <Login />;

  const title = sections.find((item) => item[1] === active)?.[0] ?? "Dashboard";

  return <main className="adminShell">
    <aside className="adminSidebar">
      <div className="adminBrand"><span>S<span>C</span>T</span><div><b>SEEK CHINA</b><small>ADMIN PORTAL</small></div></div>
      <nav aria-label="Admin navigation">{sections.map(([label, key]) => <button className={active === key ? "active" : ""} key={key} onClick={() => setActive(key)}><span>{navIcon(key)}</span>{label}</button>)}</nav>
      <div className="adminAccount"><small>SIGNED IN AS</small><span title={session.user.email}>{session.user.email}</span><button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
    </aside>
    <section className="adminWorkspace">
      <header className="adminHeader"><div><p>SEEK CHINA TRAVEL</p><h1>{title}</h1></div><span className="adminStatus"><i /> Connected to Supabase</span></header>
      {active === "dashboard" ? <Dashboard onNavigate={setActive} /> : active === "media" ? <MediaLibrary /> : <Collection title={title} rows={rows} loading={loading} message={message} onRefresh={() => loadTable(active)} />}
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
    <div className="adminLoginBrand"><b>S<span>C</span>T</b><div>SEEK CHINA<small>TRAVEL ADMINISTRATION</small></div></div>
    <p className="adminKicker">SECURE ADMIN PORTAL</p><h1>Welcome back</h1><p>Sign in to manage the SEEK CHINA TRAVEL website.</p>
    <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@seekchinatravel.com" /></label>
    <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" /></label>
    {message && <p className="adminError" role="alert">{message}</p>}
    <button className="adminPrimary" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}<span>→</span></button>
    <small className="adminSecurity">Protected by Supabase Auth. Data access is enforced by your Row Level Security policies.</small>
  </form></main>;
}

function Dashboard({ onNavigate }: { onNavigate: (key: (typeof sections)[number][1]) => void }) {
  const cards = [["Destinations", "Manage places and highlights", "destinations"], ["Tours", "Curate journeys and itineraries", "tours"], ["Inquiries", "Review new travel requests", "inquiries"], ["Media", "Upload website photography", "media"]] as const;
  return <><section className="adminWelcome"><div><p>CONTENT &amp; OPERATIONS</p><h2>Your website, all in one place.</h2><span>Manage travel content and customer activity while keeping the live experience consistent.</span></div><div className="adminWelcomeMark">中国</div></section>
  <div className="adminQuick"><h2>Quick access</h2><div>{cards.map(([name, description, key], index) => <button key={name} onClick={() => onNavigate(key)}><b>0{index + 1}</b><h3>{name}</h3><p>{description}</p><span>Open section →</span></button>)}</div></div>
  <section className="adminNotice"><span>●</span><div><b>Static-first and secure</b><p>The admin runs entirely in the browser for Cloudflare Pages. Supabase Auth and RLS remain responsible for protecting every record.</p></div></section></>;
}

function Collection({ title, rows, loading, message, onRefresh }: { title: string; rows: RecordRow[]; loading: boolean; message: string; onRefresh: () => void }) {
  const columns = rows.length ? Object.keys(rows[0]).slice(0, 6) : [];
  return <section className="adminPanel"><header><div><h2>{title}</h2><p>Live records from the Supabase public schema.</p></div><button onClick={onRefresh}>↻ Refresh</button></header>
    {message ? <div className="adminEmpty error"><b>Could not load this section</b><p>{message}</p><small>Check this user&apos;s RLS policy in Supabase.</small></div> : loading ? <div className="adminEmpty">Loading records…</div> : rows.length === 0 ? <div className="adminEmpty"><b>No records yet</b><p>There is nothing to display, or your RLS policy does not expose any rows.</p></div> : <div className="adminTableWrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column} title={formatValue(row[column])}>{formatValue(row[column])}</td>)}</tr>)}</tbody></table></div>}
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
  return <section className="adminPanel"><header><div><h2>Media Library</h2><p>Upload optimized website images to the <code>website-media</code> bucket.</p></div></header><form className="mediaUpload" onSubmit={upload}><div><b>Upload a website image</b><p>JPG, PNG, WebP or AVIF. Your Storage policies control upload access.</p></div><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><button className="adminPrimary" disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}</button></form>{result && <div className={result.startsWith("Error:") ? "mediaResult error" : "mediaResult"}><b>{result.startsWith("Error:") ? "Upload failed" : "Public URL ready"}</b><p>{result}</p>{!result.startsWith("Error:") && <button onClick={() => navigator.clipboard.writeText(result)}>Copy URL</button>}</div>}</section>;
}

function navIcon(key: string) {
  const icons: Record<string, string> = { dashboard: "⌂", site_settings: "⚙", homepage_sections: "◇", destinations: "⌖", tours: "✈", travel_guides: "▤", media: "▧", inquiries: "✉", customers: "♙", bookings: "✓" };
  return icons[key] ?? "•";
}
