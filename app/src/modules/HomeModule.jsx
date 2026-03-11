import { useEffect, useState } from "react";
import { C, EVENT_CATS, NOTE_CATS } from "../utils/constants";
import { Card } from "../components/ui";
import { fmt, MN, DN, today, todayKey, dow } from "../utils/helpers";
import { fetchNewsFeed } from "../services/DataService";

const ETF_WATCHLIST = [
  {
    isin: "IE00B4L5Y983",
    shortName: "IWDA",
    name: "iShares Core MSCI World UCITS ETF",
  },
  {
    isin: "IE00BKM4GZ66",
    shortName: "EMIM",
    name: "iShares Core MSCI EM IMI UCITS ETF",
  },
];

function getEventStartKey(ev) {
  return ev?.startDate || ev?.date || "";
}

function getEventEndKey(ev) {
  return ev?.endDate || ev?.startDate || ev?.date || "";
}

function isEventOnOrAfterToday(ev) {
  const end = getEventEndKey(ev);
  return typeof end === "string" && end >= todayKey;
}

function formatEventLabel(ev) {
  const start = getEventStartKey(ev);
  const end = getEventEndKey(ev);

  if (!start) return "";

  const s = new Date(start + "T12:00:00");

  if (!end || end === start) {
    return s.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
  }

  const e = new Date(end + "T12:00:00");

  return (
    s.toLocaleDateString("fr-BE", { day: "numeric", month: "short" }) +
    " → " +
    e.toLocaleDateString("fr-BE", { day: "numeric", month: "short" })
  );
}

export function HomeModule({ st, go }) {
  const todos = Array.isArray(st?.todos) ? st.todos : [];
  const events = Array.isArray(st?.events) ? st.events : [];
  const transactions = Array.isArray(st?.transactions) ? st.transactions : [];
  const notes = Array.isArray(st?.notes) ? st.notes : [];
  const monthlyBudget = Number.isFinite(Number(st?.monthlyBudget)) ? Number(st.monthlyBudget) : 0;

  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const visibleTodos = todos.filter((t) => !t?.dueDate);
  const pendingTodos = visibleTodos
    .filter((t) => !t?.done)
    .sort((a, b) => Number(b?.createdAt || 0) - Number(a?.createdAt || 0))
    .slice(0, 3);

  const pendingCount = visibleTodos.filter((t) => !t?.done).length;
  const doneCount = visibleTodos.filter((t) => !!t?.done).length;

  const upcoming = events
    .filter((ev) => isEventOnOrAfterToday(ev))
    .sort((a, b) => String(getEventStartKey(a)).localeCompare(String(getEventStartKey(b))))
    .slice(0, 4);

  const currentMonth = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");
  const monthTx = transactions.filter((t) => typeof t?.date === "string" && t.date.startsWith(currentMonth));
  const totalExpenses = monthTx
    .filter((t) => t?.type === "expense")
    .reduce((sum, t) => sum + Number(t?.amount || 0), 0);
  const totalIncome = monthTx
    .filter((t) => t?.type === "income")
    .reduce((sum, t) => sum + Number(t?.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const recentNotes = [...notes]
    .sort((a, b) => Number(b?.createdAt || 0) - Number(a?.createdAt || 0))
    .slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingNews(true);
      try {
        const data = await fetchNewsFeed(["ETF", "MSCI World", "Emerging Markets"], 3);
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoadingNews(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div style={{ padding: "16px 20px 0" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Home</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: C.text2 }}>
          {DN[dow(today)]} {today.getDate()} {MN[today.getMonth()]}
        </p>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <HC title="Tâches" icon="✅" onClick={() => go("todos")}>
          {pendingTodos.length === 0 ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{pendingCount}</span>
                <span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>à faire</span>
              </div>
              <div style={{ width: 1, height: 28, background: C.separator }} />
              <div>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{doneCount}</span>
                <span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>faites</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingTodos.map((todo) => (
                <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent }} />
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{todo.text}</span>
                </div>
              ))}
            </div>
          )}
        </HC>

        <HC title="Calendrier" icon="📅" onClick={() => go("calendar")}>
          {upcoming.length === 0 ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Rien de prévu</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map((ev) => {
                const cat = EVENT_CATS.find((c) => c.id === ev.category) || { color: C.text3 };
                return (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: cat.color }} />
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{ev.title}</span>
                    <span style={{ fontSize: 11, color: C.text3 }}>{formatEventLabel(ev)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </HC>

        <HC title="Finances" icon="💰" onClick={() => go("budget")}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.text3 }}>Dépenses {MN[today.getMonth()]}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(totalExpenses)}</div>
              <div style={{ height: 3, background: C.separator, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) + "%" : "0%",
                    height: "100%",
                    background: totalExpenses > monthlyBudget ? C.red : C.accent,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>

            <div style={{ width: 1, background: C.separator }} />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.text3 }}>Solde</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: balance >= 0 ? C.green : C.red }}>
                {fmt(balance)}
              </div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
                Budget mensuel : {fmt(monthlyBudget)}
              </div>
            </div>
          </div>
        </HC>

        <HC title="ETF suivis" icon="📈" onClick={() => go("budget")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ETF_WATCHLIST.map((item) => (
              <div key={item.isin} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 44 }}>{item.shortName}</span>
                <span style={{ fontSize: 14, flex: 1, color: C.text2 }}>{item.name}</span>
                <span style={{ fontSize: 11, color: C.text3 }}>Cours indisponible</span>
              </div>
            ))}
          </div>
        </HC>

        <HC title="Actu marchés" icon="📰" onClick={() => go("budget")}>
          {loadingNews ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Chargement...</span>
          ) : articles.length === 0 ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Aucune actu pour le moment</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {articles.map((a, i) => (
                <a
                  key={a.id || i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: C.text }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: C.accent, marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>
                        {a.source} {a.date ? "• " + a.date.slice(0, 10) : ""}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </HC>

        <HC title="Notes" icon="📝" onClick={() => go("notes")}>
          {recentNotes.length === 0 ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Aucune note</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentNotes.map((n) => {
                const cat = NOTE_CATS.find((c) => c.id === n.category) || { icon: "📌" };
                return (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{n.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </HC>
      </div>
    </div>
  );
}

function HC({ title, icon, onClick, children }) {
  return (
    <Card>
      <div onClick={onClick} style={{ padding: 16, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}
