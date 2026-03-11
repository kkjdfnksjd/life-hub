import { useState, useEffect, useRef } from "react";
import { C, EMPTY_STATE } from "./utils/constants";
import { Icons } from "./components/Icons";
import { Card, SubmitBtn, inputStyle, focusBorder, blurBorder } from "./components/ui";
import { BottomNav } from "./components/BottomNav";
import * as DS from "./services/DataService";
import { HomeModule } from "./modules/HomeModule";
import { TodoModule } from "./modules/TodoModule";
import { BudgetModule } from "./modules/BudgetModule";
import { CalendarModule } from "./modules/CalendarModule";
import { NotesModule } from "./modules/NotesModule";
import { SettingsModal } from "./modules/SettingsModal";
import { ChatPanel } from "./modules/ChatModule";

export default function App() {
  const [bootReady, setBootReady] = useState(false);
  const [authMode, setAuthMode] = useState("create");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sp, setSp] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [st, setSt] = useState(EMPTY_STATE);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setAuthMode(DS.hasExistingData() ? "unlock" : "create");
    setBootReady(true);
  }, []);

  useEffect(() => {
    if (!isUnlocked || !sp) return;
    let c = false;
    (async () => {
      try { if (!c) await DS.saveState(st, sp); }
      catch (e) { console.error(e); }
    })();
    return () => { c = true; };
  }, [st, isUnlocked, sp]);

  const uf = (f, n) => setSt((p) => ({
    ...p, [f]: typeof n === "function" ? n(p[f]) : n
  }));

  const onCreate = async (pass, confirm) => {
    setAuthErr("");
    if (pass.length < 8) { setAuthErr("Min. 8 caractères."); return; }
    if (pass !== confirm) { setAuthErr("Différents."); return; }
    try {
      setBusy(true);
      const s = await DS.createVault(pass);
      setSt(s); setSp(pass); setIsUnlocked(true);
    } catch(e) { setAuthErr("Erreur."); }
    finally { setBusy(false); }
  };

  const onUnlock = async (pass) => {
    setAuthErr("");
    try {
      setBusy(true);
      const s = await DS.loadState(pass);
      if (!s) { setAuthMode("create"); return; }
      setSt(s); setSp(pass); setIsUnlocked(true);
    } catch(e) { setAuthErr("Mot de passe incorrect."); }
    finally { setBusy(false); }
  };

  const onLock = () => {
    setIsUnlocked(false); setSp(""); setAuthErr("");
    setAuthMode(DS.hasExistingData() ? "unlock" : "create");
  };

  const onReset = () => {
    if (!window.confirm("Effacer toutes les données ?")) return;
    DS.resetAll(); setSp(""); setIsUnlocked(false);
    setSt(EMPTY_STATE); setAuthMode("create");
  };

  if (!bootReady) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: C.text2 }}>Chargement...</span>
    </div>
  );

  if (!isUnlocked) return (
    <UnlockScreen mode={authMode} error={authErr} busy={busy}
      onCreate={onCreate} onUnlock={onUnlock}
      hasExisting={DS.hasExistingData()} />
  );

  return (
    <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: C.bg, color: C.text, position: "relative", fontFamily: "-apple-system,sans-serif", paddingTop: "max(16px,env(safe-area-inset-top))", paddingBottom: "max(90px,calc(90px+env(safe-area-inset-bottom)))" }}>
      <div style={{ height: 18 }} />
      <div style={{ position: "fixed", top: "max(14px,env(safe-area-inset-top))", right: 16, zIndex: 120, display: "flex", gap: 8 }}>
        <TopBtn onClick={() => setShowChat(true)}><Icons.MessageCircle size={18} color={C.accent} /></TopBtn>
        <TopBtn onClick={() => setShowSettings(true)}><Icons.Settings size={18} color={C.text2} /></TopBtn>
        <TopBtn onClick={onLock}><Icons.Lock size={18} color={C.text2} /></TopBtn>
      </div>
      {st.activeTab === "home" && <HomeModule st={st} go={(t) => uf("activeTab", t)} />}
      {st.activeTab === "todos" && <TodoModule todos={st.todos} setTodos={(n) => uf("todos", n)} events={st.events} setEvents={(n) => uf("events", n)} />}
      {st.activeTab === "budget" && <BudgetModule transactions={st.transactions} setTransactions={(n) => uf("transactions", n)} monthlyBudget={st.monthlyBudget} setMonthlyBudget={(n) => uf("monthlyBudget", n)} investments={st.investments} setInvestments={(n) => uf("investments", n)} />}
      {st.activeTab === "calendar" && <CalendarModule events={st.events} setEvents={(n) => uf("events", n)} />}
      {st.activeTab === "notes" && <NotesModule notes={st.notes} setNotes={(n) => uf("notes", n)} />}
      <BottomNav activeTab={st.activeTab} onTabChange={(t) => uf("activeTab", t)} />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onReset={onReset} />}
      {showChat && <ChatPanel appState={st} onClose={() => setShowChat(false)} />}
    </div>
  );
}

function TopBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 20, border: "none",
      background: C.card, boxShadow: "0 1px 3px rgba(0,0,0,.08)",
      display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer"
    }}>{children}</button>
  );
}

function UnlockScreen({ mode, error, busy, onCreate, onUnlock, hasExisting }) {
  const [p, setP] = useState("");
  const [c, setC] = useState("");
  const r = useRef(null);
  useEffect(() => { setTimeout(() => r.current?.focus(), 120); }, []);
  const isCreate = mode === "create";
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system,sans-serif", color: C.text, padding: "max(28px,env(safe-area-inset-top)) 20px max(28px,env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 390 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Icons.Lock size={24} color={C.accent} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
            {isCreate ? "Créer ton coffre" : "Déverrouiller"}
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.5, color: C.text2 }}>
            {isCreate ? "Données chiffrées localement." : "Entre ton mot de passe."}
          </p>
          <input ref={r} type="password" placeholder="Mot de passe"
            value={p} onChange={(e) => setP(e.target.value)}
            style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          {isCreate && (
            <input type="password" placeholder="Confirmer"
              value={c} onChange={(e) => setC(e.target.value)}
              style={{ ...inputStyle, marginTop: 10 }}
              onFocus={focusBorder} onBlur={blurBorder} />
          )}
          {error && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.redLight, color: C.red, fontSize: 13, fontWeight: 600 }}>{error}</div>
          )}
          {isCreate ? (
            <SubmitBtn disabled={busy || !p || !c} onClick={() => onCreate(p, c)} text={busy ? "Création..." : "Créer et ouvrir"} />
          ) : (
            <SubmitBtn disabled={busy || !p} onClick={() => onUnlock(p)} text={busy ? "Déchiffrement..." : "Déverrouiller"} />
          )}
        </Card>
      </div>
    </div>
  );
}