import { useEffect, useMemo, useState } from "react";
import { C, NOTE_CATS, EVENT_CATS } from "../utils/constants";
import { fmt, fmtPct, MN, DN, today, todayKey, dow } from "../utils/helpers";
import { Icons } from "../components/Icons";
import { Card } from "../components/ui";
import { StarRating } from "../components/StarRating";
import { fetchNewsFeed, fetchEtfPrices } from "../services/DataService";

const HOME_ETF_ISINS = ["IE00B4L5Y983", "IE00BKM4GZ66"];

function getEventStartKey(ev) {
  return ev.startDate || ev.date || "";
}

function getEventEndKey(ev) {
  return ev.endDate || ev.startDate || ev.date || "";
}

function isEventOnOrAfterToday(ev) {
  return getEventEndKey(ev) >= todayKey;
}

function isTaskEventHidden(ev, todos) {
  if (ev.category !== "tache" || !ev.linkedTaskId) return false;
  const linked = todos.find((t) => t.id === ev.linkedTaskId);
  return Boolean(linked?.done);
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

function getTaskSortValue(todo) {
  return todo.dueDate || "9999-12-31";
}

export function HomeModule({ st, go }) {
  const { todos, transactions, events, investments, notes, monthlyBudget } = st;

  const [articles, setArticles] = useState([]);
  const [etfPrices, setEtfPrices] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingEtf, setLoadingEtf] = useState(true);

  const pendingTodos = useMemo(
    () =>
      [...todos]
        .filter((t) => !t.done)
        .sort((a, b) => {
          const aDue = getTaskSortValue(a);
          const bDue = getTaskSortValue(b);
          if (aDue !== bDue) return aDue.localeCompare(bDue);
          return (b.createdAt || 0) - (a.createdAt || 0);
        }),
    [todos]
  );

  const topTodos = pendingTodos
    .filter((todo) => {
      if (!todo.linkedEventId) return true;
      const linkedEvent = events.find((ev) => ev.id === todo.linkedEventId);
      return !linkedEvent;
    })
    .slice(0, 3);

  const done = todos.filter((t) => t.done).length;
  const overdue = todos.filter((t) => !t.done && t.dueDate && t.dueDate < todayKey).length;

  const cm = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");
  const mTx = transactions.filter((t) => t.date.startsWith(cm));
  const tOut = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const bal = mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) - tOut;
  const tInv = investments.reduce((s, p) => s + (p.currentValue || 0), 0);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((ev) => isEventOnOrAfterToday(ev))
        .filter((ev) => !isTaskEventHidden(ev, todos))
        .sort((a, b) => getEventStartKey(a).localeCompare(getEventStartKey(b)))
        .slice(0, 4),
    [events, todos]
  );

  const recent = [...notes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingEtf(true);
      try {
        const data = await fetchEtfPrices(HOME_ETF_ISINS);
        if (!cancelled) {
          setEtfPrices(Array.isArray(data) ? data.slice(0, 2) : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setEtfPrices([]);
      } finally {
        if (!cancelled) setLoadingEtf(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingNews(true);
      try {
        const data = await fetchNewsFeed(["ETF", "MSCI World", "Emerging Markets"], 4);
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data.slice(0, 4) : []);
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
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Bonjour 👋</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: C.text2 }}>
          {DN[dow(today)]} {today.getDate()} {MN[today.getMonth()]}
        </p>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <HC title="Tâches" icon="✅" onClick={() => go("todos")} badge={overdue > 0 ? overdue + " en retard" : null} badgeColor={C.red}>
          {topTodos.length === 0 ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700 }}>0</span>
                <span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>à faire</span>
              </div>
              <div style={{ width: 1, height: 28, background: C.separator }} />
              <div>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{done}</span>
                <span style={{ fontSize: 13, color: C.text2, marginLeft: 4 }}>faites</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topTodos.map((todo) => (
                <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: todo.dueDate && todo.dueDate < todayKey ? C.red : C.accent,
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{todo.text}</span>
                  {todo.dueDate && (
                    <span style={{ fontSize: 11, color: todo.dueDate < todayKey ? C.red : C.text3 }}>
                      {new Date(todo.dueDate + "T12:00:00").toLocaleDateString("fr-BE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </HC>

        <HC title="Budget" icon="💰" onClick={() => go("budget")}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.text3 }}>Dépenses {MN[today.getMonth()]}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(tOut)}</div>
              <div style={{ height: 3, background: C.separator, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: monthlyBudget > 0 ? Math.min((tOut / monthlyBudget) * 100, 100) + "%" : "0%",
                    height: "100%",
                    background: tOut > monthlyBudget ? C.red : C.accent,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>

            <div style={{ width: 1, background: C.separator }} />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.text3 }}>Solde</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: bal >= 0 ? C.green : C.red }}>{fmt(bal)}</div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>Portefeuille : {fmt(tInv)}</div>
            </div>
          </div>
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

        <HC title="ETF suivis" icon="📈" onClick={() => go("budget")}>
          {loadingEtf ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Chargement...</span>
          ) : etfPrices.length === 0 ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Cours indisponibles pour le moment</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {etfPrices.map((item) => (
                <div key={item.isin} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 44 }}>{item.shortName || item.ticker}</span>
                  <span style={{ fontSize: 14, flex: 1, color: C.text2 }}>{item.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(item.price || 0)}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: Number(item.changePercent || 0) >= 0 ? C.green : C.red,
                    }}
                  >
                    {fmtPct(Number(item.changePercent || 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
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
          {recent.length === 0 ? (
            <span style={{ fontSize: 14, color: C.text3 }}>Aucune note</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recent.map((n) => {
                const cat = NOTE_CATS.find((c) => c.id === n.category) || { icon: "📌" };
                return (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{n.title}</span>
                    <StarRating value={n.rating || 0} size={12} />
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

function HC({ title, icon, onClick, children, badge, badgeColor }) {
  return (
    <Card>
      <div onClick={onClick} style={{ padding: 16, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
            {badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: badgeColor || C.red,
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: 8,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <Icons.ArrowRight size={16} color={C.text3} />
        </div>
        {children}
      </div>
    </Card>
  );
}