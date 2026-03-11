import { useState, useEffect, useRef } from "react";
import { C, TODO_CATS } from "../utils/constants";
import { uid, todayKey } from "../utils/helpers";
import { Icons } from "../components/Icons";
import { Card, Empty, Pill, FAB, ProgressBar, Backdrop, ModalSheet, SubmitBtn, LocationLink, inputStyle, focusBorder, blurBorder } from "../components/ui";
export function TodoModule({ todos, setTodos, events, setEvents }) {
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [swId, setSwId] = useState(null);
  const filtered = filter === "all" ? todos : todos.filter((t) => t.category === filter);
  const sorted = [...filtered].sort((a, b) => { if (a.done !== b.done) return a.done ? 1 : -1; if (!a.done && a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate); return b.createdAt - a.createdAt; });
  const pi = filter === "all" ? todos : todos.filter((t) => t.category === filter);
  const dc = pi.filter((t) => t.done).length, tot = pi.length;
  const ac = TODO_CATS.find((c) => c.id === filter);
  const addTodo = (text, cat, dueDate, location) => {
    const todo = { id: uid(), text, category: cat, done: false, createdAt: Date.now(), dueDate: dueDate || "", location: location || "" };
    setTodos((p) => [todo, ...p]);
    if (dueDate) setEvents((p) => [...p, { id: uid(), title: "\u{1F4CB} " + text, date: dueDate, time: "", category: "tache", allDay: true, location: location || "" }]);
    setShowAdd(false);
  };
  return (<div>
    <div style={{ padding: "16px 20px 0" }}><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Mes t&acirc;ches</h1><ProgressBar value={dc} max={tot} label={ac ? dc + "/" + tot + " " + ac.label.toLowerCase() : dc + "/" + tot + " termin\u00e9es"} color={ac ? ac.color : C.green} /></div>
    <div style={{ display: "flex", gap: 8, padding: "16px 20px 8px", overflowX: "auto", scrollbarWidth: "none" }}><Pill label="Tout" active={filter === "all"} onClick={() => setFilter("all")} color={C.accent} count={todos.length} />{TODO_CATS.map((cat) => { const c = todos.filter((t) => t.category === cat.id).length; return c > 0 ? <Pill key={cat.id} label={cat.icon + " " + cat.label} active={filter === cat.id} onClick={() => setFilter(cat.id)} color={cat.color} count={c} /> : null; })}</div>
    <div style={{ padding: "8px 20px" }}><Card>{sorted.length === 0 ? <Empty text="Aucune t\u00e2che." /> : sorted.map((todo, i) => (<TodoItem key={todo.id} todo={todo} isLast={i === sorted.length - 1} onToggle={() => setTodos((p) => p.map((t) => t.id === todo.id ? { ...t, done: !t.done } : t))} onDelete={() => { setTodos((p) => p.filter((t) => t.id !== todo.id)); setSwId(null); }} isSwiped={swId === todo.id} onSwipe={() => setSwId(swId === todo.id ? null : todo.id)} />))}</Card>{dc > 0 && <button onClick={() => setTodos((p) => p.filter((t) => !t.done))} style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: C.red, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "8px 16px" }}>Supprimer {dc} termin&eacute;e{dc > 1 ? "s" : ""}</button>}</div>
    <FAB onClick={() => setShowAdd(true)} />{showAdd && <AddTodoModal onAdd={addTodo} onClose={() => setShowAdd(false)} />}
  </div>);
}
function TodoItem({ todo, isLast, onToggle, onDelete, isSwiped, onSwipe }) {
  const cat = TODO_CATS.find((c) => c.id === todo.category);
  const sx = useRef(0);
  const over = !todo.done && todo.dueDate && todo.dueDate < todayKey;
  const isToday = !todo.done && todo.dueDate && todo.dueDate === todayKey;
  return (<div style={{ position: "relative", overflow: "hidden" }} onTouchStart={(e) => (sx.current = e.touches[0].clientX)} onTouchEnd={(e) => { const d = sx.current - e.changedTouches[0].clientX; if (d > 60) onSwipe(); if (d < -60 && isSwiped) onSwipe(); }}>
    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={onDelete}><Icons.Trash size={20} color="white" /></div>
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.card, borderBottom: isLast ? "none" : ".5px solid " + C.separator, transition: "transform .25s cubic-bezier(.25,.46,.45,.94)", transform: isSwiped ? "translateX(-80px)" : "translateX(0)", cursor: "pointer", position: "relative", zIndex: 1 }}>
      <div style={{ width: 24, height: 24, borderRadius: 12, border: todo.done ? "none" : "2px solid " + C.text3, background: todo.done ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{todo.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="6 12 10.5 16.5 18 8" /></svg>}</div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 16, color: todo.done ? C.text3 : C.text, textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.3 }}>{todo.text}</div>{todo.dueDate && <div style={{ fontSize: 11, marginTop: 3, color: over ? C.red : isToday ? C.orange : C.text3, fontWeight: over ? 600 : 400, display: "flex", alignItems: "center", gap: 4 }}><Icons.Calendar size={11} color={over ? C.red : isToday ? C.orange : C.text3} />{over ? "En retard \u2014 " : isToday ? "Aujourd'hui \u2014 " : ""}{new Date(todo.dueDate + "T12:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" })}</div>}<LocationLink location={todo.location} /></div>
      {cat && <div style={{ width: 8, height: 8, borderRadius: 4, background: cat.color, opacity: todo.done ? 0.3 : 0.8 }} />}
    </div>
  </div>);
}
function AddTodoModal({ onAdd, onClose }) {
  const [text, setText] = useState(""); const [cat, setCat] = useState("courses"); const [due, setDue] = useState(""); const [location, setLocation] = useState(""); const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);
  return (<><Backdrop onClick={onClose} /><ModalSheet>
    <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Nouvelle t&acirc;che</h3>
    <input ref={ref} type="text" placeholder="Qu'est-ce qu'il faut faire ?" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) onAdd(text.trim(), cat, due, location); }} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
    <div style={{ marginTop: 10 }}><label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>&Eacute;ch&eacute;ance (optionnel)</label><input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ ...inputStyle, marginTop: 6, padding: "12px 16px", fontSize: 14 }} /></div>
    <div style={{ marginTop: 10 }}><label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>{"\u{1F4CD}"} Lieu (optionnel)</label><input type="text" placeholder="Adresse ou nom du lieu" value={location} onChange={(e) => setLocation(e.target.value)} style={{ ...inputStyle, marginTop: 6 }} onFocus={focusBorder} onBlur={blurBorder} /></div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, marginBottom: 18 }}>{TODO_CATS.map((c) => (<button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "8px 14px", borderRadius: 10, border: cat === c.id ? "2px solid " + c.color : "1.5px solid " + C.separator, background: cat === c.id ? c.color + "15" : "transparent", color: cat === c.id ? c.color : C.text2, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{c.icon} {c.label}</button>))}</div>
    <SubmitBtn disabled={!text.trim()} onClick={() => text.trim() && onAdd(text.trim(), cat, due, location)} text="Ajouter" />
  </ModalSheet></>);
}
