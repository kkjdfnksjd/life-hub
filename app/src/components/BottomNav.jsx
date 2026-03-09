import { C, NAV_ITEMS } from "../utils/constants";
import { Icons } from "./Icons";
export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.navBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: ".5px solid " + C.navBorder, display: "flex", justifyContent: "space-around", alignItems: "flex-start", paddingTop: 8, paddingBottom: "calc(28px + env(safe-area-inset-bottom))", zIndex: 100 }}>
      {NAV_ITEMS.map((item) => { const a = activeTab === item.id; const Ic = Icons[item.icon]; return (<button key={item.id} onClick={() => onTabChange(item.id)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: "4px 10px", WebkitTapHighlightColor: "transparent" }}><Ic size={22} color={a ? C.accent : C.text3} /><span style={{ fontSize: 9, fontWeight: 500, color: a ? C.accent : C.text3 }}>{item.label}</span></button>); })}
    </nav>
  );
}
