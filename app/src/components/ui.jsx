import { C, mapsUrl } from "../utils/constants";
import { fmt } from "../utils/helpers";
import { Icons } from "./Icons";
export function ProgressBar({ value, max, label, color }) {
  const p = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (<div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}><div style={{ flex: 1, height: 4, background: C.separator, borderRadius: 2, overflow: "hidden" }}><div style={{ width: p + "%", height: "100%", background: color, borderRadius: 2, transition: "width .4s ease" }} /></div><span style={{ fontSize: 13, color: C.text2, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span></div>);
}
export function DonutChart({ segments, size = 120, th = 18 }) {
  const r = (size - th) / 2, ci = 2 * Math.PI * r; let o = 0;
  return (<svg width={size} height={size} viewBox={"0 0 " + size + " " + size}>{segments.map((s, i) => { const d = (s.pct / 100) * ci, off = -o; o += d; return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={th} strokeDasharray={d + " " + (ci-d)} strokeDashoffset={off} transform={"rotate(-90 " + size/2 + " " + size/2 + ")"}/>; })}</svg>);
}
export function Sparkline({ data, color, width = 48, height = 24 }) {
  const u = data.filter((d) => typeof d.value === "number"); if (u.length < 2) return null;
  const v = u.map((d) => d.value), mn = Math.min(...v), mx = Math.max(...v), rng = mx - mn || 1;
  return (<svg width={width} height={height}><polyline points={v.map((val, i) => ((i/(v.length-1))*width) + "," + (height-((val-mn)/rng)*(height-4)-2)).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
export function Pill({ label, active, onClick, color, count }) {
  return (<button onClick={onClick} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: active ? color : C.card, color: active ? "white" : C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, boxShadow: active ? "none" : "0 .5px 1px rgba(0,0,0,.06)" }}>{label}{count !== undefined && <span style={{ fontSize: 11, fontWeight: 700, opacity: .7 }}>{count}</span>}</button>);
}
export function FAB({ onClick }) {
  return (<button onClick={onClick} style={{ position: "fixed", bottom: "calc(100px + env(safe-area-inset-bottom))", right: "max(20px, calc(50% - 195px))", width: 56, height: 56, borderRadius: 28, background: C.accent, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,122,255,.35)", zIndex: 50 }} onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.92)")} onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}><Icons.Plus size={28} color="white" /></button>);
}
export function Card({ children, style: s }) { return <div style={{ background: C.card, borderRadius: 12, overflow: "hidden", boxShadow: "0 .5px 0 rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.04)", ...s }}>{children}</div>; }
export function Empty({ text }) { return <div style={{ padding: "32px 20px", textAlign: "center", color: C.text3, fontSize: 14 }}>{text}</div>; }
export function CatIcon({ icon, color, size = 36 }) { return <div style={{ width: size, height: size, borderRadius: size > 30 ? 10 : 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 30 ? 18 : 14, flexShrink: 0 }}>{icon}</div>; }
export function SumCard({ label, amount, color, icon }) {
  return (<div style={{ flex: 1, background: C.card, borderRadius: 12, padding: "14px 12px", boxShadow: "0 .5px 0 rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.04)" }}><div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>{icon}<span style={{ fontSize: 11, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: .3 }}>{label}</span></div><div style={{ fontSize: 17, fontWeight: 700, color, letterSpacing: -.3 }}>{fmt(Math.abs(amount))}</div></div>);
}
export function MiniStat({ label, value, color }) { return (<div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}><div style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 14, fontWeight: 700, color: color || C.text }}>{value}</div></div>); }
export function Backdrop({ onClick }) { return <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 200, animation: "fadeIn .2s ease" }} />; }
export function ModalSheet({ children }) { return (<div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.card, borderRadius: "16px 16px 0 0", padding: "20px 20px calc(40px + env(safe-area-inset-bottom))", zIndex: 201, animation: "slideUp .3s cubic-bezier(.25,.46,.45,.94)", maxHeight: "85vh", overflowY: "auto" }}><div style={{ width: 36, height: 5, borderRadius: 3, background: C.separator, margin: "0 auto 20px" }} />{children}</div>); }
export function SubmitBtn({ disabled, onClick, text, color = C.accent }) { return <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: 15, marginTop: 16, borderRadius: 14, border: "none", background: disabled ? C.separator : color, color: disabled ? C.text3 : "white", fontSize: 16, fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: "inherit" }}>{text}</button>; }
export function SegToggle({ options, active, onChange }) { return (<div style={{ display: "flex", margin: "14px 20px 12px", background: C.separator, borderRadius: 10, padding: 2 }}>{options.map((t) => (<button key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: active === t.id ? C.card : "transparent", color: active === t.id ? C.text : C.text2, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: active === t.id ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>{t.label}</button>))}</div>); }
export function LocationLink({ location }) {
  if (!location) return null;
  return (<a href={mapsUrl(location)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: C.accent, display: "flex", alignItems: "center", gap: 3, textDecoration: "none", marginTop: 2 }}><Icons.MapPin size={11} color={C.accent} />{location.length > 35 ? location.slice(0, 35) + "\u2026" : location}</a>);
}
export const inputStyle = { width: "100%", padding: "14px 16px", fontSize: 16, border: "1px solid " + C.separator, borderRadius: 12, outline: "none", background: C.bg, color: C.text, boxSizing: "border-box", fontFamily: "inherit" };
export const focusBorder = (e) => (e.target.style.borderColor = C.accent);
export const blurBorder = (e) => (e.target.style.borderColor = C.separator);
