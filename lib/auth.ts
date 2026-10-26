import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

// ponytail: one file = connection + schema + seed + auth. Split when a second
// subsystem needs the DB. scrypt from node:crypto instead of a bcrypt dependency.
//
// ponytail: plain SQLite file, one connection per module instance (proxy and
// route handlers each get their own). Swap for a pool/WAL if write contention
// shows up under real load.

export type Role = "owner" | "editor" | "viewer";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  personId: string;
}

export const SESSION_COOKIE = "dms.session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, seconds
/** ponytail: local demo credential for the seeded accounts, prototype only. */
export const SEED_PASSWORD = "relay-demo-1";

const SESSION_MS = SESSION_MAX_AGE * 1000;
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Must stay aligned with lib/mock.ts people (p1..p5) so documents seeded with
// ownerId p1..p5 keep resolving to the right names. scripts/check-auth.mjs
// guards the drift.
const SEED: { personId: string; name: string; role: Role }[] = [
  { personId: "p1", name: "Maria Okafor", role: "owner" },
  { personId: "p2", name: "Devon Reyes", role: "owner" },
  { personId: "p3", name: "Priya Nair", role: "editor" },
  { personId: "p4", name: "Tom Beck", role: "viewer" },
  { personId: "p5", name: "Ana Sofia Lima", role: "editor" },
];

const DB_PATH = process.env.DMS_DB_PATH ?? join(process.cwd(), "data", "dms.db");

const emailFor = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, ".") + "@acme.com";

/* ---------- password hashing (scrypt, node:crypto only) ---------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const want = Buffer.from(hash, "hex");
  const got = scryptSync(password, salt, 64);
  return want.length === got.length && timingSafeEqual(want, got);
}

/* ---------- connection ---------- */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    person_id TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS resets (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`;

function open(): DatabaseSync {
  if (DB_PATH !== ":memory:") mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(SCHEMA);
  return db;
}

// Survives dev HMR: without this, every hot reload opens another handle.
const g = globalThis as { __dmsDb?: DatabaseSync };
// Module-local: a hot-reloaded module re-runs getDb's repair branch once so a
// handle opened by older code (missing, say, `resets`) is brought up to date.
let schemaRepaired = false;

export function getDb(): DatabaseSync {
  if (!g.__dmsDb) {
    const db = open();
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    if (n === 0) {
      const ins = db.prepare(
        "INSERT INTO users (id, email, name, role, person_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)"
      );
      for (const s of SEED) {
        ins.run(`u-${s.personId}`, emailFor(s.name), s.name, s.role, s.personId, hashPassword(SEED_PASSWORD));
      }
    }
    g.__dmsDb = db;
  } else if (!schemaRepaired) {
    // CREATE TABLE IF NOT EXISTS is idempotent; a few ms on this size. Next
    // dev servers may hold a handle from before a schema change landed.
    g.__dmsDb.exec(SCHEMA);
    schemaRepaired = true;
  }
  return g.__dmsDb;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  person_id: string;
}

const toUser = (r: unknown): AuthUser | null => {
  if (!r) return null;
  const x = r as UserRow;
  return { id: x.id, email: x.email, name: x.name, role: x.role, personId: x.person_id };
};

/* ---------- users ---------- */

export function listUsers(): AuthUser[] {
  return (getDb().prepare("SELECT * FROM users ORDER BY name").all() as unknown[]).flatMap((r) => {
    const u = toUser(r);
    return u ? [u] : [];
  });
}

// ponytail: precomputed per-process so the unknown-email path runs scrypt and
// takes ~the same time as a wrong password for a known email (enumeration).
const DUMMY_HASH = hashPassword("dummy-password-for-timing");

export function verifyCredentials(email: string, password: string): AuthUser | null {
  const r = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!r) {
    verifyPassword(password, DUMMY_HASH);
    return null;
  }
  if (!verifyPassword(password, (r as UserRow & { password_hash: string }).password_hash)) return null;
  return toUser(r);
}

export function createUser(input: { name: string; email: string; password: string }): AuthUser {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  if (name.length < 2) throw new Error("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (input.password.length > 256) throw new Error("Password must be 256 characters or fewer.");

  const db = getDb();
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    throw new Error("That email is already registered.");
  }

  const id = `u-${randomBytes(8).toString("hex")}`;
  // ponytail: self-serve signups join as viewers; admins promote them later.
  db.prepare("INSERT INTO users (id, email, name, role, person_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    email,
    name,
    "viewer",
    id,
    hashPassword(input.password)
  );
  return { id, email, name, role: "viewer", personId: id };
}

/* ---------- sessions ---------- */

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, new Date(Date.now() + SESSION_MS).toISOString());
  return token;
}

export function getSessionUser(token: string): AuthUser | null {
  const db = getDb();
  const r = db
    .prepare("SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?")
    .get(token) as (UserRow & { expires_at: string }) | undefined;
  if (!r) return null;
  if (new Date(r.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return toUser(r);
}

export function destroySession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/* ---------- owner-managed roles ---------- */

export function changeUserRole(actor: AuthUser, targetPersonId: string, role: Role): AuthUser {
  if (actor.role !== "owner") throw new Error("Only owners can change roles.");
  const db = getDb();
  const r = db.prepare("SELECT * FROM users WHERE person_id = ?").get(targetPersonId) as
    | (UserRow & { password_hash: string })
    | undefined;
  if (!r) throw new Error("Member not found.");
  if (r.person_id === actor.personId) throw new Error("You can't change your own role.");
  db.prepare("UPDATE users SET role = ? WHERE person_id = ?").run(role, targetPersonId);
  const updated = toUser(r) as AuthUser; // r is non-null (guarded above)
  return { ...updated, role };
}

/* ---------- password reset ---------- */

export function createResetToken(email: string): { ok: true; devResetUrl?: string } {
  const r = getDb().prepare("SELECT id FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!r) return { ok: true }; // no account: same answer, no token, no enumeration
  const token = randomBytes(32).toString("hex");
  getDb()
    .prepare("INSERT INTO resets (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, (r as { id: string }).id, new Date(Date.now() + RESET_TTL_MS).toISOString());
  return {
    ok: true,
    // ponytail: no mail service in this prototype — return the link in dev; in
    // production this string is simply never built.
    devResetUrl: process.env.NODE_ENV !== "production" ? `/reset-password?token=${token}` : undefined,
  };
}

export function getUserForResetToken(token: string): AuthUser | null {
  const db = getDb();
  const r = db
    .prepare(
      "SELECT u.*, s.expires_at FROM resets s JOIN users u ON u.id = s.user_id WHERE s.token = ?"
    )
    .get(token) as (UserRow & { expires_at: string }) | undefined;
  if (!r) return null;
  if (new Date(r.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM resets WHERE token = ?").run(token);
    return null;
  }
  return toUser(r);
}

export function resetPassword(token: string, password: string): AuthUser {
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (password.length > 256) throw new Error("Password must be 256 characters or fewer.");
  const user = getUserForResetToken(token);
  if (!user) throw new Error("This reset link has expired or already been used.");
  const db = getDb();
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), user.id);
  db.prepare("DELETE FROM resets WHERE token = ?").run(token);
  // A changed password must kill every session that trusted the old one.
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  return user;
}
