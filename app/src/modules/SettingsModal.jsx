import { C } from "../utils/constants";
import { exportState, importState } from "../services/DataService";
import { Icons } from "../components/Icons";
import { Card, Backdrop, ModalSheet } from "../components/ui";
export function SettingsModal({ onClose, onReset, passphrase, onImport }) {
  return (<><Backdrop onClick={onClose} /><ModalSheet>
    <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Réglages</h3>
    <Card style={{ marginBottom: 12 }}><div style={{ padding: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Chiffrement AES-256</div><div style={{ fontSize: 14, lineHeight: 1.55, color: C.text2 }}>Tes données sont chiffrées localement avec ton mot de passe.</div></div></Card>
    <Card style={{ marginBottom: 12 }}><div style={{ padding: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Backend Cloudflare</div><div style={{ fontSize: 14, color: C.text2 }}>Statut : <span style={{ color: C.orange, fontWeight: 600 }}>Non connecté</span></div><div style={{ fontSize: 13, color: C.text3, marginTop: 6 }}>Les cours ETF, le flux actu et le chat IA seront activés une fois le Worker configuré.</div></div></Card>
    <Card style={{ marginBottom: 12 }}><div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sauvegarde</div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: C.text2, marginBottom: 12 }}>Exporte ou importe tes donnees en JSON.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={async () => { if (passphrase) await exportState(passphrase); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.accentLight, color: C.accent, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Exporter</button>
        <label style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.greenLight, color: C.green, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>Importer<input type="file" accept=".json" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (f && passphrase && onImport) { try { const s = await importState(f, passphrase); onImport(s); } catch(err) { alert("Erreur import: " + err.message); } } }} /></label>
      </div>
    </div></Card>
    <Card><div style={{ padding: 16 }}><div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.red }}>Zone de danger</div><div style={{ fontSize: 14, color: C.text2, marginBottom: 14 }}>Effacer toutes les données chiffrées de cet appareil.</div><button onClick={onReset} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: C.red, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Tout effacer</button></div></Card>
  </ModalSheet></>);
}
