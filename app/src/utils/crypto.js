export const APP_STORAGE_KEY = "monapp_secure_v1";
const LEGACY_KEYS = ["monapp_activeTab","monapp_todos","monapp_transactions","monapp_monthlyBudget","monapp_investments","monapp_events"];
export function clearLegacyStorage() { LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)); }
export function clearSecureStorage() { localStorage.removeItem(APP_STORAGE_KEY); }
function u8ToB64(bytes) { let b=""; const ch=0x8000; for(let i=0;i<bytes.length;i+=ch) b+=String.fromCharCode(...bytes.subarray(i,i+ch)); return btoa(b); }
function b64ToU8(base64) { const b=atob(base64); const u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
async function deriveKey(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function encryptState(data, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plain = new TextEncoder().encode(JSON.stringify(data));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  return { v: 1, salt: u8ToB64(salt), iv: u8ToB64(iv), data: u8ToB64(cipher) };
}
export async function decryptState(payload, passphrase) {
  const salt = b64ToU8(payload.salt); const iv = b64ToU8(payload.iv); const data = b64ToU8(payload.data);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}
