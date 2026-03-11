import { useState, useEffect, useRef, useMemo } from "react";
import { C, EVENT_CATS } from "../utils/constants";
import { uid, MN, MN_S, DN, today, todayKey, toKey, sameDay, dow } from "../utils/helpers";
import { Icons } from "../components/Icons";
import {
  Card,
  Empty,
  FAB,
  ProgressBar,
  Backdrop,
  ModalSheet,
  SubmitBtn,
  SegToggle,
  LocationLink,
  inputStyle,
  focusBorder,
  blurBorder,
} from "../components/ui";

function getEventStartKey(ev) {
  return ev.startDate || ev.date || "";
}

function getEventEndKey(ev) {
  return ev.endDate || ev.startDate || ev.date || "";
}

function eventOccursOnDay(ev, key) {
  const start = getEventStartKey(ev);
  const end = getEventEndKey(ev);
  if (!start) return false;
  return key >= start && key <= end;
}

function formatEventDateLabel(ev) {
  const start = getEventStartKey(ev);
  const end = getEventEndKey(ev);

  if (!start) return "";
  if (!end || end === start) {
    return new Date(start + "T12:00:00").toLocaleDateString("fr-BE", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    new Date(start + "T12:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" }) +
    " → " +
    new Date(end + "T12:00:00").toLocaleDateString("fr-BE", { day: "numeric", month: "short" })
  );
}

export function CalendarModule({ events, setEvents }) {
  const [vm, setVm] = useState("month");
  const [cd, setCd] = useState(new Date(today));
  const [sd, setSd] = useState(new Date(today));
  const [showAdd, setShowAdd] = useState(false);

  const goN = () => {
    const d = new Date(cd);
    vm === "month" ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
    setCd(d);
  };

  const goP = () => {
    const d = new Date(cd);
    vm === "month" ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
    setCd(d);
  };

  const goT = () => {
    setCd(new Date(today));
    setSd(new Date(today));
  };

  const selectedKey = toKey(sd);

  const se = events
    .filter((e) => eventOccursOnDay(e, selectedKey))
    .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));

  const up = useMemo(() => {
    const l = new Date(today);
    l.setDate(l.getDate() + 30);
    const endKey = toKey(l);

    return events
      .filter((e) => getEventEndKey(e) >= todayKey && getEventStartKey(e) <= endKey)
      .sort((a, b) => getEventStartKey(a).localeCompare(getEventStartKey(b)));
  }, [events]);

  const ws = new Date(today);
  ws.setDate(ws.getDate() - dow(ws));
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);

  const wEv = events.filter((e) => getEventEndKey(e) >= toKey(ws) && getEventStartKey(e) <= toKey(we));

  return (
    <div>
      <div style={{ padding: "16px 20px 0" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Calendrier</h1>
        <ProgressBar
          value={wEv.filter((e) => getEventEndKey(e) < todayKey).length}
          max={wEv.length}
          label={wEv.length + " évén. cette sem."}
          color={C.accent}
        />
      </div>

      <SegToggle options={[{ id: "month", label: "Mois" }, { id: "week", label: "Semaine" }]} active={vm} onChange={setVm} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 10px" }}>
        <button onClick={goP} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icons.ChevLeft size={22} color={C.text2} />
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>
            {vm === "month" ? MN[cd.getMonth()] + " " + cd.getFullYear() : "Sem. " + cd.getDate() + " " + MN_S[cd.getMonth()]}
          </span>
          {!sameDay(cd, today) && (
            <button
              onClick={goT}
              style={{
                marginLeft: 10,
                background: C.accentLight,
                border: "none",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: C.accent,
                cursor: "pointer",
              }}
            >
              Auj.
            </button>
          )}
        </div>

        <button onClick={goN} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icons.ChevRight size={22} color={C.text2} />
        </button>
      </div>

      {vm === "month" ? <MView cd={cd} sd={sd} onSel={setSd} ev={events} /> : <WView cd={cd} sd={sd} onSel={setSd} ev={events} />}

      <div style={{ padding: "12px 20px 4px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {sameDay(sd, today) ? "Aujourd'hui" : sd.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      <div style={{ padding: "4px 20px 12px" }}>
        {se.length === 0 ? (
          <Card>
            <Empty text="Rien de prévu" />
          </Card>
        ) : (
          <Card>
            {se.map((ev, i) => (
              <EvRow key={ev.id} ev={ev} last={i === se.length - 1} onDel={() => setEvents((p) => p.filter((e) => e.id !== ev.id))} />
            ))}
          </Card>
        )}
      </div>

      <div style={{ padding: "8px 20px 4px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text2, textTransform: "uppercase", letterSpacing: 0.5 }}>
          À venir (30j)
        </span>
      </div>

      <div style={{ padding: "4px 20px 20px" }}>
        <Card>
          {up.length === 0 ? (
            <Empty text="Rien" />
          ) : (
            up
              .slice(0, 8)
              .map((ev, i) => (
                <EvRow
                  key={ev.id}
                  ev={ev}
                  last={i === Math.min(up.length, 8) - 1}
                  showDate
                  onDel={() => setEvents((p) => p.filter((e) => e.id !== ev.id))}
                />
              ))
          )}
        </Card>
      </div>

      <FAB onClick={() => setShowAdd(true)} />
      {showAdd && (
        <AddEvModal
          def={toKey(sd)}
          onAdd={(ev) => {
            setEvents((p) => [...p, { id: uid(), ...ev }]);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function MView({ cd, sd, onSel, ev }) {
  const y = cd.getFullYear();
  const m = cd.getMonth();

  let s = new Date(y, m, 1).getDay();
  s = s === 0 ? 6 : s - 1;

  const dim = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < s; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(y, m, d));

  return (
    <div style={{ padding: "0 20px 8px" }}>
      <Card style={{ padding: "12px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
          {DN.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: C.text3, padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {cells.map((date, i) => {
            if (!date) return <div key={"e" + i} />;

            const k = toKey(date);
            const isT = sameDay(date, today);
            const isS = sameDay(date, sd);

            const de = ev.filter((e) => eventOccursOnDay(e, k));
            const dots = [...new Set(de.map((e) => (EVENT_CATS.find((c) => c.id === e.category) || { color: C.text3 }).color))].slice(0, 3);

            return (
              <button
                key={k}
                onClick={() => onSel(new Date(date))}
                style={{
                  background: isS ? C.accent : isT ? C.accentLight : "transparent",
                  color: isS ? "white" : isT ? C.accent : C.text,
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 2px 4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  minHeight: 44,
                  fontWeight: isT || isS ? 700 : 400,
                  fontSize: 15,
                }}
              >
                {date.getDate()}
                {de.length > 0 && (
                  <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                    {dots.map((c, j) => (
                      <div key={j} style={{ width: 4, height: 4, borderRadius: 2, background: isS ? "rgba(255,255,255,.7)" : c }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function WView({ cd, sd, onSel, ev }) {
  const d = new Date(cd);
  const dw = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (dw === 0 ? 6 : dw - 1));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    days.push(dd);
  }

  return (
    <div style={{ padding: "0 20px 8px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {days.map((day) => {
          const k = toKey(day);
          const isT = sameDay(day, today);
          const isS = sameDay(day, sd);
          const ec = ev.filter((e) => eventOccursOnDay(e, k)).length;

          return (
            <button
              key={k}
              onClick={() => onSel(new Date(day))}
              style={{
                flex: 1,
                padding: "8px 2px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: isS ? C.accent : isT ? C.accentLight : C.card,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: isS ? "rgba(255,255,255,.7)" : C.text3 }}>{DN[dow(day)]}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: isS ? "white" : isT ? C.accent : C.text }}>{day.getDate()}</span>
              {ec > 0 && <div style={{ width: 5, height: 5, borderRadius: 3, background: isS ? "rgba(255,255,255,.7)" : C.accent, marginTop: 1 }} />}
            </button>
          );
        })}
      </div>

      <Card>
        {(() => {
          const k = toKey(sd);
          const de = ev
            .filter((e) => eventOccursOnDay(e, k))
            .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));

          return de.length === 0 ? <Empty text="Rien" /> : de.map((e, i) => <EvRow key={e.id} ev={e} last={i === de.length - 1} />);
        })()}
      </Card>
    </div>
  );
}

function EvRow({ ev, last, showDate, onDel }) {
  const cat = EVENT_CATS.find((c) => c.id === ev.category) || { icon: "📌", color: C.text3, label: "Autre" };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: last ? "none" : ".5px solid " + C.separator }}>
      <div style={{ width: 4, height: 32, borderRadius: 2, background: cat.color, flexShrink: 0 }} />

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, textDecoration: ev.completed ? "line-through" : "none", opacity: ev.completed ? 0.6 : 1 }}>
          {ev.title}
        </div>

        <div style={{ fontSize: 12, color: C.text3, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {showDate && <span>{formatEventDateLabel(ev)}</span>}
          {ev.time && <span>{showDate ? "- " : ""}{ev.time}</span>}
          {ev.allDay && !ev.time && <span>{showDate ? "- " : ""}Journée</span>}
          <span
            style={{
              background: cat.color + "18",
              color: cat.color,
              padding: "1px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {cat.label}
          </span>
          {Array.isArray(ev.tags) && ev.tags.includes("travel") && (
            <span
              style={{
                background: C.teal + "18",
                color: C.teal,
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              travel
            </span>
          )}
        </div>

        <LocationLink location={ev.location} />
      </div>

      {onDel && (
        <button
          onClick={onDel}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.3, display: "flex" }}
        >
          <Icons.Trash size={16} color={C.text3} />
        </button>
      )}
    </div>
  );
}

function AddEvModal({ def, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(def);
  const [endDate, setEndDate] = useState(def);
  const [time, setTime] = useState("");
  const [cat, setCat] = useState("perso");
  const [allDay, setAllDay] = useState(true);
  const [location, setLocation] = useState("");
  const [travel, setTravel] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 100);
  }, []);

  return (
    <>
      <Backdrop onClick={onClose} />
      <ModalSheet>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Nouvel événement</h3>

        <input
          ref={ref}
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>Début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) setEndDate(e.target.value);
              }}
              style={{ ...inputStyle, marginTop: 6, padding: "14px 12px", fontSize: 14 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ ...inputStyle, marginTop: 6, padding: "14px 12px", fontSize: 14 }}
            />
          </div>
        </div>

        {!allDay && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>Heure</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, marginTop: 6, padding: "14px 12px", fontSize: 14 }}
            />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "8px 0" }}>
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Journée entière</span>
          <button
            onClick={() => {
              setAllDay(!allDay);
              if (!allDay) setTime("");
            }}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: allDay ? C.green : C.separator,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: "white",
                position: "absolute",
                top: 2,
                left: allDay ? 22 : 2,
                transition: "left .2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,.15)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2, padding: "8px 0" }}>
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Tag voyage</span>
          <button
            onClick={() => {
              const next = !travel;
              setTravel(next);
              if (next) setCat("voyage");
            }}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: travel ? C.teal : C.separator,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: "white",
                position: "absolute",
                top: 2,
                left: travel ? 22 : 2,
                transition: "left .2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,.15)",
              }}
            />
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>Lieu (optionnel)</label>
          <input
            type="text"
            placeholder="Adresse ou nom du lieu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, marginBottom: 18 }}>
          {EVENT_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: cat === c.id ? "2px solid " + c.color : "1.5px solid " + C.separator,
                background: cat === c.id ? c.color + "15" : "transparent",
                color: cat === c.id ? c.color : C.text2,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <SubmitBtn
          disabled={!title.trim() || !startDate || !endDate}
          onClick={() =>
            title.trim() &&
            onAdd({
              title: title.trim(),
              date: startDate,
              startDate,
              endDate: endDate < startDate ? startDate : endDate,
              time: allDay ? "" : time,
              category: travel ? "voyage" : cat,
              allDay,
              location: location.trim(),
              tags: travel ? ["travel"] : [],
              completed: false,
            })
          }
          text="Ajouter"
        />
      </ModalSheet>
    </>
  );
}