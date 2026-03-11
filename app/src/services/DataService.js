import { APP_STORAGE_KEY, encryptState, decryptState, clearLegacyStorage, clearSecureStorage } from "../utils/crypto";
import { EMPTY_STATE, EMPTY_INVESTMENTS } from "../utils/constants";
const MODE = "cloudflare";
const CF_API_BASE = "https://life-hub-api.douzieme-phenol-4h.workers.dev";
export function hasExistingData() { return !!localStorage.getItem(APP_STORAGE_KEY); }
export async function saveState(state, passphrase) {
  const encrypted = await encryptState(state, passphrase);
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(encrypted));
  return true;
}
export async function loadState(passphrase) {
  const raw = localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) return null;
  const decrypted = await decryptState(JSON.parse(raw), passphrase);
  return { ...EMPTY_STATE, ...decrypted,
    investments: Array.isArray(decrypted.investments) && decrypted.investments.length > 0 ? decrypted.investments : EMPTY_INVESTMENTS,
    notes: Array.isArray(decrypted.notes) ? decrypted.notes : [],
    newsFeed: Array.isArray(decrypted.newsFeed) ? decrypted.newsFeed : [],
    chatHistory: Array.isArray(decrypted.chatHistory) ? decrypted.chatHistory : [],
  };
}
export async function createVault(passphrase) {
  clearLegacyStorage();
  const state = { ...EMPTY_STATE };
  await saveState(state, passphrase);
  return state;
}
export function resetAll() { clearSecureStorage(); clearLegacyStorage(); }
export async function fetchNewsFeed(keywords) {
  if (MODE === "cloudflare" && CF_API_BASE) {
    try { const r = await fetch(CF_API_BASE + "/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords }) }); if (r.ok) return await r.json(); } catch(e) { console.warn(e); }
  }
  return [];
}
export async function sendChatMessage(message, context) {
  if (MODE === "cloudflare" && CF_API_BASE) {
    try { const r = await fetch(CF_API_BASE + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, context }) }); if (r.ok) { const d = await r.json(); return d.reply; } } catch(e) { console.warn(e); }
  }
  return "\u{1F4AC} Le chat IA sera disponible une fois le backend Cloudflare connecté. En attendant, pose ta question sur claude.ai !";
}
