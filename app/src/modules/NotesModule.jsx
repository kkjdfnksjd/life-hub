import { useState, useEffect, useRef } from "react";
import { C, NOTE_CATS, NOTE_STATUSES } from "../utils/constants";
import { uid } from "../utils/helpers";
import { Card, Empty, Pill, FAB, ProgressBar, CatIcon, Backdrop, ModalSheet, SubmitBtn, inputStyle, focusBorder, blurBorder } from "../components/ui";
import { StarRating } from "../components/StarRating";
export function NotesModule({ notes, setNotes }) {
  const [filter, setFilter] = useState("all"); const [sf, setSf] = useState("all"); const [showAdd, setShowAdd] = useState(false); const [expId, setExpId] = useState(null);
  const filtered = notes.filter((n) => (filter === "all" || n.category === filter) && (sf === "all" || n.status === sf)).sort((a, b) => b.createdAt - a.createdAt);
  const dc = notes.filter((n) => n.status === "done").length;
  return (<div>
    <div style={{ padding: "16px 20px 0" }}><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Notes</h1><ProgressBar value={dc} max={notes.length} label={dc + "/" + notes.length + " vus"} color={C.purple} /></div>
    <div style={{ display: "flex", gap: 8, padding: "16px 20px 4px", overflowX: "auto", scrollbarWidth: "none" }}><Pill label="Tout" active={filter === "all"} onClick={() => setFilter("all")} color={C.accent} count={notes.length} />{NOTE_CATS.map((cat) => { const c = notes.filter((n) => n.category === cat.id).length; return c > 0 ? <Pill key={cat.id} label={cat.icon + " " + cat.label} active={filter === cat.id} onClick={() => setFilter(cat.id)} color={cat.color} count={c} /> : null; })}</div>
    <div style={{ display: "flex", gap: 8, padding: "8px 20px 12px" }}><Pill label="Tous" active={sf === "all"} onClick={() => setSf("all")} color={C.text2} />{NOTE_STATUSES.map((s) => <Pill key={s.id} label={s.label} active={sf === s.id} onClick={() => setSf(s.id)} color={s.color} />)}</div>
    <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>{filtered.length === 0 ? <Card><Empty text="Aucune note." /></Card> : filtered.map((note) => {
      const cat = NOTE_CATS.find((c) => c.id === note.category) || { icon: "\u{1F4CC}", color: C.text3 }; const status = NOTE_STATUSES.find((s) => s.id === note.status) || NOTE_STATUSES[0]; const isO = expId === note.id;
      return (<Card key={note.id}><div onClick={() => setExpId(isO ? null : note.id)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}><CatIcon icon={cat.icon} color={cat.color} /><div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600 }}>{note.title}</div><div style={{ fontSize: 12, color: C.text3, marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}><span style={{ background: status.color + "18", color: status.color, padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{status.label}</span>{note.author && <span>{note.author}</span>}</div></div><StarRating value={note.rating || 0} size={14} /></div>
        {isO && <div style={{ borderTop: ".5px solid " + C.separator, padding: "12px 16px 16px" }}>{note.comment && <div style={{ fontSize: 14, lineHeight: 1.5, color: C.text2, marginBottom: 12, fontStyle: "italic" }}>"{note.comment}"</div>}<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{NOTE_STATUSES.map((s) => (<button key={s.id} onClick={(e) => { e.stopPropagation(); setNotes((p) => p.map((n) => n.id === note.id ? { ...n, status: s.id } : n)); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: note.status === s.id ? s.color : C.bg, color: note.status === s.id ? "white" : C.text2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s.label}</button>))}</div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span style={{ fontSize: 13, color: C.text2 }}>Note :</span><StarRating value={note.rating || 0} onChange={(r) => setNotes((p) => p.map((n) => n.id === note.id ? { ...n, rating: r } : n))} size={20} /></div><button onClick={(e) => { e.stopPropagation(); setNotes((p) => p.filter((n) => n.id !== note.id)); setExpId(null); }} style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: C.redLight, color: C.red, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Supprimer</button></div>}
      </Card>);
    })}</div>
    <FAB onClick={() => setShowAdd(true)} />{showAdd && <AddNoteModal onAdd={(note) => { setNotes((p) => [{ id: uid(), createdAt: Date.now(), ...note }, ...p]); setShowAdd(false); }} onClose={() => setShowAdd(false)} />}
  </div>);
}
function AddNoteModal({ onAdd, onClose }) {
  const [title, setTitle] = useState(""); const [cat, setCat] = useState("film"); const [status, setStatus] = useState("to_see"); const [rating, setRating] = useState(0); const [comment, setComment] = useState(""); const [author, setAuthor] = useState(""); const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);
  return (<><Backdrop onClick={onClose} /><ModalSheet>
    <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Nouvelle note</h3>
    <input ref={ref} type="text" placeholder="Titre (film, livre, lieu...)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
    <input type="text" placeholder="Auteur / R\u00e9alisateur (optionnel)" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ ...inputStyle, marginTop: 10 }} onFocus={focusBorder} onBlur={blurBorder} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{NOTE_CATS.map((c) => (<button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "8px 12px", borderRadius: 10, border: cat === c.id ? "2px solid " + c.color : "1.5px solid " + C.separator, background: cat === c.id ? c.color + "15" : "transparent", color: cat === c.id ? c.color : C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>{c.icon} {c.label}</button>))}</div>
    <div style={{ marginTop: 14 }}><div style={{ fontSize: 13, color: C.text2, marginBottom: 8 }}>Statut</div><div style={{ display: "flex", gap: 8 }}>{NOTE_STATUSES.map((s) => <button key={s.id} onClick={() => setStatus(s.id)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", background: status === s.id ? s.color : C.bg, color: status === s.id ? "white" : C.text2, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{s.label}</button>)}</div></div>
    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 13, color: C.text2 }}>Note :</span><StarRating value={rating} onChange={setRating} size={24} /></div>
    <textarea placeholder="Ton avis (optionnel)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ ...inputStyle, marginTop: 14, resize: "vertical", minHeight: 70 }} />
    <SubmitBtn disabled={!title.trim()} onClick={() => title.trim() && onAdd({ title: title.trim(), category: cat, status, rating, comment: comment.trim(), author: author.trim() })} text="Ajouter" />
  </ModalSheet></>);
}
