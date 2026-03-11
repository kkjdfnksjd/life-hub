import { APP_STORAGE_KEY, encryptState, decryptState, clearLegacyStorage, clearSecureStorage } from "../utils/crypto";
import { EMPTY_STATE, EMPTY_INVESTMENTS } from "../utils/constants";

const MODE = "cloudflare";
const CF_API_BASE = "https://life-hub-api.douzieme-phenol-4h.workers.dev";
const VALID_TABS = new Set(["home", "todos", "budget", "calendar", "notes"]);

export function hasExistingData() {
  return !!localStorage.getItem(APP_STORAGE_KEY);
}

export async function saveState(state, passphrase) {
  const encrypted = await encryptState(state, passphrase);
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(encrypted));
  return true;
}

export async function loadState(passphrase) {
  const raw = localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) return null;

  const decrypted = await decryptState(JSON.parse(raw), passphrase);

  const activeTab = VALID_TABS.has(decrypted?.activeTab) ? decrypted.activeTab : "home";

  return {
    ...EMPTY_STATE,
    ...decrypted,
    activeTab,
    investments:
      Array.isArray(decrypted?.investments) && decrypted.investments.length > 0
        ? decrypted.investments
        : EMPTY_INVESTMENTS,
    notes: Array.isArray(decrypted?.notes) ? decrypted.notes : [],
    newsFeed: Array.isArray(decrypted?.newsFeed) ? decrypted.newsFeed : [],
    chatHistory: Array.isArray(decrypted?.chatHistory) ? decrypted.chatHistory : [],
    todos: Array.isArray(decrypted?.todos) ? decrypted.todos : [],
    events: Array.isArray(decrypted?.events) ? decrypted.events : [],
    transactions: Array.isArray(decrypted?.transactions) ? decrypted.transactions : [],
    monthlyBudget: Number.isFinite(Number(decrypted?.monthlyBudget)) ? Number(decrypted.monthlyBudget) : EMPTY_STATE.monthlyBudget,
  };
}

export async function createVault(passphrase) {
  clearLegacyStorage();
  const state = { ...EMPTY_STATE };
  await saveState(state, passphrase);
  return state;
}

export function resetAll() {
  clearSecureStorage();
  clearLegacyStorage();
}

export async function fetchNewsFeed(keywords = [], limit = 4) {
  if (MODE === "cloudflare" && CF_API_BASE) {
    try {
      const r = await fetch(CF_API_BASE + "/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, limit }),
      });

      if (r.ok) {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn("fetchNewsFeed error", e);
    }
  }

  return [];
}

export async function fetchEtfPrices(isins = []) {
  if (MODE === "cloudflare" && CF_API_BASE) {
    try {
      const r = await fetch(CF_API_BASE + "/api/etf-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isins }),
      });

      if (!r.ok) return [];

      const data = await r.json();

      if (data?.disabled) return [];
      if (Array.isArray(data?.items)) return data.items;
      if (data?.byIsin && typeof data.byIsin === "object") {
        return Object.values(data.byIsin).filter((x) => x && !x.error);
      }
    } catch (e) {
      console.warn("fetchEtfPrices error", e);
    }
  }

  return [];
}

export async function sendChatMessage(message, context) {
  if (MODE === "cloudflare" && CF_API_BASE) {
    try {
      const r = await fetch(CF_API_BASE + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });

      if (r.ok) {
        const d = await r.json();
        return d.reply;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  return "💬 Le chat IA sera disponible une fois le backend Cloudflare connecté. En attendant, pose ta question sur claude.ai !";
}
