// "Lockup" - a layered password-hashing scheme for Broadside (course demo).
// Stages are named after the letterpress process:
//   COMPOSE: pepper + salt + password are combined with HMAC-SHA256
//   INK:     PBKDF2-SHA256 stretches the result (210,000 rounds)
//   PULL:    a final HMAC-SHA512 seals the output with a version tag
// NOTE: coursework demo. Real systems should use bcrypt/Argon2 on a server,
// and a pepper must never live in client code.

const enc = new TextEncoder();
const VERSION = "v1";
const ITERATIONS = 210000;
const PEPPER = "broadside-guild-demo-pepper"; // demo only

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hmac(keyBytes, data, hash) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
}

function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

async function derive(password, salt, iterations) {
  const pw = enc.encode(password.normalize("NFKC"));
  // COMPOSE
  const composed = await hmac(enc.encode(PEPPER), concat(salt, pw), "SHA-256");
  // INK
  const base = await crypto.subtle.importKey("raw", composed, "PBKDF2", false, ["deriveBits"]);
  const inked = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, 256));
  // PULL
  return hmac(inked, concat(salt, enc.encode(VERSION)), "SHA-512");
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const out = await derive(password, salt, ITERATIONS);
  return ["lockup", VERSION, ITERATIONS, b64(salt), b64(out)].join("$");
}

export async function verifyPassword(password, stored) {
  const [tag, ver, iters, saltB64, hashB64] = stored.split("$");
  if (tag !== "lockup" || ver !== VERSION) return false;
  const out = await derive(password, unb64(saltB64), Number(iters));
  const expected = unb64(hashB64);
  if (expected.length !== out.length) return false;
  let diff = 0; // constant-time compare
  for (let i = 0; i < out.length; i++) diff |= out[i] ^ expected[i];
  return diff === 0;
}

export function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"][score];
}
