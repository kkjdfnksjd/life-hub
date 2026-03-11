import { useState, useRef, useEffect } from "react";
import { C } from "../utils/constants";
import { Icons } from "../components/Icons";
import { Backdrop, inputStyle, focusBorder, blurBorder } from "../components/ui";
import { sendChatMessage } from "../services/DataService";
export function ChatPanel({ appState, onClose }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Salut ! Pose-moi une question sur tes t\u00e2ches, ton budget ou tes \u00e9v\u00e9nements." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);
  const buildContext = () => {
    const { todos, transactions, events, investments, notes } = appState;
    const td = new Date().toISOString().slice(0, 10);
    return { todosPending: todos.filter((t) => !t.done).length, monthlyExpenses: transactions.filter((t) => t.type === "expense" && t.date.startsWith(td.slice(0, 7))).reduce((s, t) => s + t.amount, 0), upcomingEvents: events.filter((e) => e.date >= td).slice(0, 5).map((e) => e.title + " (" + e.date + ")"), portfolioValue: investments.reduce((s, p) => s + p.currentValue, 0), notesCount: notes.length };
  };
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput(""); setMessages((p) => [...p, { role: "user", text: msg }]); setLoading(true);
    try { const reply = await sendChatMessage(msg, buildContext()); setMessages((p) => [...p, { role: "assistant", text: reply }]); }
    catch { setMessages((p) => [...p, { role: "assistant", text: "D\u00e9sol\u00e9, une erreur. R\u00e9essaie." }]); }
    finally { setLoading(false); }
  };
  return (<><Backdrop onClick={onClose} /><div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, height: "75vh", background: C.bg, borderRadius: "16px 16px 0 0", zIndex: 201, animation: "slideUp .3s cubic-bezier(.25,.46,.45,.94)", display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "16px 20px", borderBottom: ".5px solid " + C.separator, display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 12, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.MessageCircle size={20} color={C.accent} /></div><div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700 }}>Assistant IA</div><div style={{ fontSize: 11, color: C.text3 }}>{loading ? "R\u00e9flexion\u2026" : "Connect\u00e9"}</div></div><button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.text3, padding: 4 }}>{"\u2715"}</button></div>
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>{messages.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}><div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 16, background: m.role === "user" ? C.accent : C.card, color: m.role === "user" ? "white" : C.text, fontSize: 14, lineHeight: 1.5, borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "user" ? 16 : 4, boxShadow: m.role === "assistant" ? "0 .5px 2px rgba(0,0,0,.06)" : "none" }}>{m.text}</div></div>))}{loading && <div style={{ display: "flex", marginBottom: 8 }}><div style={{ padding: "10px 14px", borderRadius: 16, background: C.card, color: C.text3, borderBottomLeftRadius: 4 }}>{"\u25CF\u25CF\u25CF"}</div></div>}<div ref={endRef} /></div>
    <div style={{ padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: ".5px solid " + C.separator, background: C.card, display: "flex", gap: 8, alignItems: "center" }}><input ref={inputRef} type="text" placeholder="Pose une question\u2026" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} style={{ ...inputStyle, flex: 1, padding: "12px 16px", fontSize: 15 }} onFocus={focusBorder} onBlur={blurBorder} /><button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: input.trim() && !loading ? C.accent : C.separator, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "default" }}><Icons.Send size={18} color={input.trim() && !loading ? "white" : C.text3} /></button></div>
  </div></>);
}
