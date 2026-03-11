import { useState, useEffect, useRef, useMemo } from "react";
import { C, BUDGET_CATS, PORTFOLIOS } from "../utils/constants";
import { uid, fmt, fmtPct, MN, today, toKey } from "../utils/helpers";
import { Icons } from "../components/Icons";
import { Card, Empty, Pill, FAB, ProgressBar, DonutChart, Sparkline, CatIcon, SumCard, MiniStat, Backdrop, ModalSheet, SubmitBtn, SegToggle, inputStyle, focusBorder, blurBorder } from "../components/ui";
import { fetchNewsFeed } from "../services/DataService";
export function BudgetModule({ transactions, setTransactions, monthlyBudget, setMonthlyBudget, investments, setInvestments }) {
  const [sub, setSub] = useState("budget");
  return (<div><div style={{ padding: "16px 20px 0" }}><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Finances</h1></div>
    <SegToggle options={[{ id: "budget", label: "Budget" }, { id: "invest", label: "Investissements" }, { id: "feed", label: "Actu" }, { id: "dca", label: "Projection" }, { id: "tob", label: "TOB" }]} active={sub} onChange={setSub} />
    {sub === "budget" && <BudgetSub transactions={transactions} setTransactions={setTransactions} monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget} />}
    {sub === "invest" && <InvestSub investments={investments} setInvestments={setInvestments} />}
    {sub === "feed" && <NewsFeed investments={investments} />}
    {sub === "dca" && <DCAProjection />}
    {sub === "tob" && <TOBHelper />}
  </div>);
}
function DCAProjection() {
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(7);
  const totalInvested = monthly * 12 * years;
  const r = rate / 100 / 12;
  const n = years * 12;
  const futureValue = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
  const gain = futureValue - totalInvested;
  return (<div style={{ padding: "0 20px 20px" }}>
    <Card><div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Simulateur DCA</div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: C.text2 }}>Montant mensuel</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <input type="range" min="50" max="2000" step="50" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 70, textAlign: "right" }}>{fmt(monthly)}</span>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: C.text2 }}>Horizon (ann\u00e9es)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <input type="range" min="1" max="40" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 50, textAlign: "right" }}>{years} ans</span>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: C.text2 }}>Rendement annuel estim\u00e9</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <input type="range" min="1" max="15" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 50, textAlign: "right" }}>{rate}%</span>
        </div>
      </div>
      <div style={{ background: C.bg, borderRadius: 12, padding: 16, display: "flex", gap: 10 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Investi</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(totalInvested)}</div>
        </div>
        <div style={{ width: 1, background: C.separator }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Valeur finale</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{fmt(futureValue)}</div>
        </div>
        <div style={{ width: 1, background: C.separator }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Plus-value</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{fmt(gain)}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: C.text3, lineHeight: 1.5, textAlign: "center" }}>
        Simulation bas\u00e9e sur un rendement de {rate}% annuel avec int\u00e9r\u00eats compos\u00e9s mensuels. Pass performance ne garantit pas les r\u00e9sultats futurs.
      </div>
    </div></Card>
  </div>);
}

function TOBHelper() {
  const quarters = [
    { label: "T1 (jan-mar)", deadline: "31 mars", months: "Janvier - Mars" },
    { label: "T2 (avr-jun)", deadline: "30 juin", months: "Avril - Juin" },
    { label: "T3 (jul-sep)", deadline: "30 septembre", months: "Juillet - Septembre" },
    { label: "T4 (oct-d\u00e9c)", deadline: "31 d\u00e9cembre", months: "Octobre - D\u00e9cembre" },
  ];
  const currentQ = Math.floor(today.getMonth() / 3);
  const rules = [
    { type: "ETF capitalisant (BE)", rate: "1,32%", cap: "4 000\u20ac/transaction", color: C.red },
    { type: "ETF distribuant", rate: "0,12%", cap: "Pas de plafond", color: C.orange },
    { type: "Actions individuelles", rate: "0,35%", cap: "1 600\u20ac/transaction", color: C.accent },
  ];
  return (<div style={{ padding: "0 20px 20px" }}>
    <Card><div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Taxe sur Op\u00e9rations Boursi\u00e8res</div>
      <div style={{ fontSize: 13, color: C.text3, marginBottom: 16 }}>Belgique - D\u00e9claration trimestrielle</div>
      {rules.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? ".5px solid " + C.separator : "none" }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: r.color }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{r.type}</div>
            <div style={{ fontSize: 12, color: C.text3 }}>Plafond : {r.cap}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: r.color }}>{r.rate}</div>
        </div>
      ))}
    </div></Card>
    <div style={{ marginTop: 12 }} />
    <Card><div style={{ padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>\u00c9ch\u00e9ances</div>
      {quarters.map((q, i) => {
        const isActive = i === currentQ;
        const isPast = i < currentQ;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? ".5px solid " + C.separator : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: isActive ? C.orange : isPast ? C.green + "20" : C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: isActive ? "white" : isPast ? C.green : C.text3 }}>
              {isPast ? "\u2713" : "Q" + (i + 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? C.text : C.text2 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: C.text3 }}>{q.months}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.orange : C.text3 }}>{q.deadline}</div>
          </div>
        );
      })}
    </div></Card>
    <div style={{ marginTop: 12 }} />
    <Card><div style={{ padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Comment d\u00e9clarer</div>
      <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
        1. T\u00e9l\u00e9charge le formulaire TOB sur MyMinfin{String.fromCharCode(10)}
        2. D\u00e9clare chaque transaction du trimestre{String.fromCharCode(10)}
        3. Paie via virement au SPF Finances{String.fromCharCode(10)}
        4. D\u00e9lai : dernier jour du mois suivant le trimestre
      </div>
    </div></Card>
  </div>);
}

function NewsFeed({ investments }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const keywords = useMemo(() => {
    const fromInvestments = investments.flatMap((p) => {
      const d = PORTFOLIOS.find((x) => x.id === p.id);
      return d?.keywords || [];
    });

    const base = ["ETF", "MSCI World", "Emerging Markets"];
    return [...new Set([...base, ...fromInvestments])].filter(Boolean).slice(0, 8);
  }, [investments]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchNewsFeed(keywords, 6);
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [keywords.join("|")]);

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Rss size={16} color={C.accent} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text2, textTransform: "uppercase" }}>
            Actualités marchés
          </span>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          style={{
            background: C.accentLight,
            border: "none",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: C.accent,
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Rafraîchir"}
        </button>
      </div>

      {loading ? (
        <Card>
          <Empty text="Chargement..." />
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <Empty text="Aucune actualité pour le moment." />
        </Card>
      ) : (
        articles.map((a, i) => (
          <Card key={a.id || i} style={{ marginBottom: 8 }}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: C.text, display: "block", padding: "14px 16px" }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
                {a.title}
              </div>

              {a.summary && (
                <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.45, marginBottom: 6 }}>
                  {a.summary}
                </div>
              )}

              <div style={{ fontSize: 11, color: C.text3, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span>{a.source}</span>
                <span>{a.date ? a.date.slice(0, 10) : ""}</span>
              </div>
            </a>
          </Card>
        ))
      )}
    </div>
  );
}


function InvestSub({ investments, setInvestments }) {
  const [selId, setSelId] = useState(null); const [showUp, setShowUp] = useState(false);
  const tI = investments.reduce((s, p) => s + p.invested, 0); const tV = investments.reduce((s, p) => s + p.currentValue, 0);
  const tG = tV - tI; const tPct = tI > 0 ? ((tV - tI) / tI) * 100 : 0;
  const segs = investments.map((p) => ({ pct: tV > 0 ? (p.currentValue / tV) * 100 : 0, color: PORTFOLIOS.find((x) => x.id === p.id)?.color || C.text3 }));
  const ad = investments.flatMap((p) => (p.history || []).map((h) => new Date(h.date).getTime())).filter(Boolean);
  const lu = ad.length > 0 ? Math.max(...ad) : 0; const ds = lu ? Math.floor((Date.now() - lu) / 864e5) : 999;
  const hUp = (pid, nv) => { setInvestments((pr) => pr.map((p) => p.id !== pid ? p : { ...p, currentValue: nv, history: [...(p.history || []), { date: toKey(new Date()), invested: p.invested, value: nv }] })); setShowUp(false); };
  return (<div>
    {ds >= 25 && <div style={{ margin: "0 20px 12px", padding: "12px 16px", borderRadius: 12, background: C.orangeLight, display: "flex", alignItems: "center", gap: 10 }}><Icons.Clock size={18} color={C.orange} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>MAJ mensuelle</div><div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{lu ? ds + " jours" : "Jamais"}</div></div><button onClick={() => setShowUp(true)} style={{ background: C.orange, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>MAJ</button></div>}
    <div style={{ padding: "0 20px 12px" }}><Card><div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 20 }}><div style={{ position: "relative" }}><DonutChart segments={segs} /><div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 11, color: C.text2 }}>Total</div><div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(tV)}</div></div></div><div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text2, marginBottom: 4 }}>Performance</div><div style={{ fontSize: 24, fontWeight: 700, color: tG >= 0 ? C.green : C.red }}>{tG >= 0 ? "+" : ""}{fmt(tG)}</div><div style={{ fontSize: 14, color: tPct >= 0 ? C.green : C.red, fontWeight: 600, marginTop: 2 }}>{fmtPct(tPct)}</div><div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>Investi : {fmt(tI)}</div></div></div><div style={{ padding: "0 16px 16px", display: "flex", gap: 16, flexWrap: "wrap" }}>{investments.map((p) => { const d = PORTFOLIOS.find((x) => x.id === p.id); return <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: d?.color }} /><span style={{ fontSize: 11, color: C.text2 }}>{d?.name}</span></div>; })}</div></Card></div>
    <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>{investments.map((p) => { const d = PORTFOLIOS.find((x) => x.id === p.id); const g = p.currentValue - p.invested; const pct = p.invested > 0 ? ((p.currentValue - p.invested) / p.invested) * 100 : 0; const isO = selId === p.id;
      return (<div key={p.id}><Card><div onClick={() => setSelId(isO ? null : p.id)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: d.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{d.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16, fontWeight: 600 }}>{d.name}</span><span style={{ fontSize: 11, color: C.text3, background: C.bg, padding: "2px 8px", borderRadius: 6 }}>{d.type}</span></div><div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>{p.monthlyDCA > 0 ? "DCA " + fmt(p.monthlyDCA) + "/mois · " : ""}Investi {fmt(p.invested)}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(p.currentValue)}</div><div style={{ fontSize: 13, fontWeight: 600, color: g >= 0 ? C.green : C.red }}>{fmtPct(pct)}</div></div><Sparkline data={(p.history || []).map((h) => ({ value: h.value }))} color={d.color} /></div>
        {isO && <div style={{ borderTop: ".5px solid " + C.separator, padding: "12px 16px 16px" }}><div style={{ display: "flex", gap: 10, marginBottom: 14 }}><MiniStat label="Investi" value={fmt(p.invested)} /><MiniStat label="Valeur" value={fmt(p.currentValue)} /><MiniStat label="Gain" value={(g >= 0 ? "+" : "") + fmt(g)} color={g >= 0 ? C.green : C.red} /></div><div style={{ fontSize: 12, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Composition</div>{p.holdings.length === 0 ? <Empty text="Vide" /> : p.holdings.map((h, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>{h.ticker && <div style={{ fontSize: 11, color: C.text3 }}>{h.ticker}</div>}</div><div style={{ width: 60, height: 3, background: C.separator, borderRadius: 2, overflow: "hidden" }}><div style={{ width: h.allocation + "%", height: "100%", background: d.color, borderRadius: 2 }} /></div><div style={{ fontSize: 13, fontWeight: 600, color: C.text2, minWidth: 36, textAlign: "right" }}>{h.allocation}%</div></div>))}<div style={{ fontSize: 12, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: .5, marginTop: 14, marginBottom: 8 }}>Historique</div><div style={{ maxHeight: 160, overflowY: "auto" }}>{(p.history || []).length === 0 ? <Empty text="Vide" /> : [...p.history].reverse().map((h, i) => { const hp = h.invested > 0 ? ((h.value - h.invested) / h.invested) * 100 : 0; return <div key={i} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderTop: i > 0 ? ".5px solid " + C.separator : "none" }}><div style={{ fontSize: 13, color: C.text2, flex: 1 }}>{new Date(h.date).toLocaleDateString("fr-BE", { month: "short", year: "numeric" })}</div><div style={{ fontSize: 13, fontWeight: 500, marginRight: 12 }}>{fmt(h.value)}</div><div style={{ fontSize: 12, fontWeight: 600, color: hp >= 0 ? C.green : C.red, minWidth: 50, textAlign: "right" }}>{fmtPct(hp)}</div></div>; })}</div><button onClick={() => setShowUp(true)} style={{ marginTop: 12, width: "100%", padding: 10, borderRadius: 10, border: "none", background: d.color + "15", color: d.color, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>MAJ valeur</button></div>}
      </Card></div>); })}</div>
    {showUp && <UpModal inv={investments} onUp={hUp} onClose={() => setShowUp(false)} />}
  </div>);
}
function UpModal({ inv, onUp, onClose }) {
  const [sel, setSel] = useState(inv[0]?.id || ""); const [val, setVal] = useState(""); const cur = inv.find((p) => p.id === sel);
  return (<><Backdrop onClick={onClose} /><ModalSheet><h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Mettre à jour</h3><div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{inv.map((p) => { const d = PORTFOLIOS.find((x) => x.id === p.id); return <button key={p.id} onClick={() => { setSel(p.id); setVal(""); }} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", background: sel === p.id ? d.color : C.bg, color: sel === p.id ? "white" : C.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span style={{ fontSize: 20 }}>{d.icon}</span>{d.name}</button>; })}</div>{cur && <div style={{ fontSize: 13, color: C.text2, marginBottom: 10, padding: "8px 12px", background: C.bg, borderRadius: 8 }}>Actuelle : <strong>{fmt(cur.currentValue)}</strong></div>}<div style={{ position: "relative" }}><input type="number" placeholder="Nouvelle valeur" value={val} onChange={(e) => setVal(e.target.value)} style={{ ...inputStyle, fontSize: 20, fontWeight: 700, paddingRight: 32 }} onFocus={focusBorder} onBlur={blurBorder} /><span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.text3, fontSize: 16 }}>€</span></div><SubmitBtn disabled={!Number(val)} onClick={() => Number(val) && onUp(sel, Number(val))} text="Enregistrer" /></ModalSheet></>);
}
function AddTxModal({ onAdd, onClose }) {
  const [type, setType] = useState("expense"); const [label, setLabel] = useState(""); const [amount, setAmount] = useState(""); const [cat, setCat] = useState("courses_b"); const [date, setDate] = useState(toKey(new Date())); const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);
  const cats = type === "income" ? BUDGET_CATS.income : BUDGET_CATS.expense;
  useEffect(() => { setCat(cats[0].id); }, [type]);
  const v = label.trim() && Number(amount) > 0;
  return (<><Backdrop onClick={onClose} /><ModalSheet><h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Nouvelle transaction</h3><div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{[{ id: "expense", label: "Dépense", c: C.red }, { id: "income", label: "Revenu", c: C.green }].map((t) => (<button key={t.id} onClick={() => setType(t.id)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, background: type === t.id ? t.c : C.bg, color: type === t.id ? "white" : C.text2, cursor: "pointer" }}>{t.label}</button>))}</div><input ref={ref} type="text" placeholder="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} /><div style={{ display: "flex", gap: 10, marginTop: 10, marginBottom: 14 }}><div style={{ flex: 1, position: "relative" }}><input type="number" placeholder="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...inputStyle, paddingRight: 32 }} onFocus={focusBorder} onBlur={blurBorder} /><span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.text3, fontSize: 16 }}>€</span></div><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, padding: "14px 12px", fontSize: 14 }} /></div><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>{cats.map((c) => (<button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "8px 12px", borderRadius: 10, border: cat === c.id ? "2px solid " + c.color : "1.5px solid " + C.separator, background: cat === c.id ? c.color + "15" : "transparent", color: cat === c.id ? c.color : C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>{c.icon} {c.label}</button>))}</div><SubmitBtn disabled={!v} onClick={() => v && onAdd({ label: label.trim(), amount: Number(amount), type, category: cat, date })} text="Ajouter" /></ModalSheet></>);
}
