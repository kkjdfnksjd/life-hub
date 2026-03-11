import { C, NOTE_CATS, EVENT_CATS } from "../utils/constants";
import { fmt, MN, MN_S, DN, today, todayKey, dow } from "../utils/helpers";
import { Icons } from "../components/Icons";
import { Card } from "../components/ui";
import { StarRating } from "../components/StarRating";
export function HomeModule({ st, go }) {
  const { todos, transactions, events, investments, notes, monthlyBudget } = st;
  const pending = todos.filter((t) => !t.done).length;
  const done = todos.filter((t) => t.done).length;
  const overdue = todos.filter((t) => !t.done && t.dueDate && t.dueDate < todayKey).length;
  const cm = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");
  const mTx = transactions.filter((t) => t.date.startsWith(cm));
  const tOut = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const bal = mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) - tOut;
  const tInv = investments.reduce((s, p) => s + p.currentValue, 0);
  const upcoming = events.filter((e) => e.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const recent = [...notes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  return (<div>
    <div style={{ padding: "16px 20px 0" }}><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -.5, margin: 0 }}>Bonjour {"\u{1F44B}"}</h1><p style={{ margin: "6px 0 0", fontSize: 15, color: C.text2 }}>{DN[dow(today)]} {today.getDate()} {MN[today.getMonth()]}</p></div>
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <HC title="T\u00e2ches" icon={"\u2705"} onClick={() => go("todos")} badge={overdue > 0 ? overdue + " en retard" : null} badgeColor={C.red}><div style={{ display: "flex", gap: 16, alignItems: "center" }}><div><span style={{ fontSize: 28, fontWeight: 700 }}>{pending}</span><span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>{"\u00e0"} faire</span></div><div style={{ width: 1, height: 28, background: C.separator }} /><div><span style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{done}</span><span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>faites</span></div></div></HC>
      <HC title="Budget" icon={"\u{1F4B0}"} onClick={() => go("budget")}><div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text3 }}>D{"\u00e9"}penses {MN_S[today.getMonth()]}</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(tOut)}</div><div style={{ height: 3, background: C.separator, borderRadius: 2, marginTop: 6, overflow: "hidden" }}><div style={{ width: monthlyBudget > 0 ? Math.min((tOut / monthlyBudget) * 100, 100) + "%" : "0%", height: "100%", background: tOut > monthlyBudget ? C.red : C.accent, borderRadius: 2 }} /></div></div><div style={{ width: 1, background: C.separator }} /><div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text3 }}>Solde</div><div style={{ fontSize: 22, fontWeight: 700, color: bal >= 0 ? C.green : C.red }}>{fmt(bal)}</div><div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>Portefeuille : {fmt(tInv)}</div></div></div></HC>
      <HC title="Calendrier" icon={"\u{1F4C5}"} onClick={() => go("calendar")}>{upcoming.length === 0 ? <span style={{ fontSize: 14, color: C.text3 }}>Rien de pr{"\u00e9"}vu</span> : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{upcoming.map((ev) => { const cat = EVENT_CATS.find((c) => c.id === ev.category) || { color: C.text3 }; const d = new Date(ev.date + "T12:00:00"); const diff = Math.ceil((d - today) / 864e5); return (<div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 4, height: 20, borderRadius: 2, background: cat.color }} /><span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{ev.title}</span><span style={{ fontSize: 11, color: C.text3 }}>{diff === 0 ? "Auj." : diff === 1 ? "Demain" : diff + "j"}</span></div>); })}</div>}</HC>
      <HC title="Notes" icon={"\u{1F4DD}"} onClick={() => go("notes")}>{recent.length === 0 ? <span style={{ fontSize: 14, color: C.text3 }}>Aucune note</span> : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{recent.map((n) => { const cat = NOTE_CATS.find((c) => c.id === n.category) || { icon: "\u{1F4CC}" }; return (<div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{cat.icon}</span><span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{n.title}</span><StarRating value={n.rating || 0} size={12} /></div>); })}</div>}</HC>
    </div>
  </div>);
}
function HC({ title, icon, onClick, children, badge, badgeColor }) {
  return (<Card><div onClick={onClick} style={{ padding: 16, cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{icon}</span><span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>{badge && <span style={{ fontSize: 10, fontWeight: 700, background: badgeColor || C.red, color: "white", padding: "2px 8px", borderRadius: 8 }}>{badge}</span>}</div><Icons.ArrowRight size={16} color={C.text3} /></div>{children}</div></Card>);
}
