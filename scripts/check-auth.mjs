import assert from "node:assert/strict";

// ponytail: in-memory DB so the check never touches data/dms.db. Must be set
// before lib/auth.ts is imported (it reads the path at module scope).
process.env.DMS_DB_PATH = ":memory:";

const a = await import("../lib/auth.ts");
const { people } = await import("../lib/mock.ts");

// Seed users stay aligned with the mock people, so documents seeded with
// ownerId p1..p5 keep resolving to the right names.
assert.deepEqual(
  a.listUsers().map((u) => u.personId).sort(),
  people.map((p) => p.id).sort()
);

// Seeded demo login
const maria = a.verifyCredentials("maria.okafor@acme.com", a.SEED_PASSWORD);
assert.equal(maria?.role, "owner");
assert.equal(maria?.personId, "p1");
assert.equal(a.verifyCredentials("maria.okafor@acme.com", "wrong-pass"), null);
assert.equal(a.verifyCredentials("nobody@acme.com", a.SEED_PASSWORD), null);

// Hashing round-trip: correct password passes, wrong one fails, same input
// hashes differently (random salt => two hashes never match each other).
const h = a.hashPassword("hunter-2-2");
assert.equal(a.verifyPassword("hunter-2-2", h), true);
assert.equal(a.verifyPassword("hunter-2-3", h), false);
assert.notEqual(a.hashPassword("hunter-2-2"), a.hashPassword("hunter-2-2"));

// Registration rules
const u = a.createUser({ name: "Ada New", email: "Ada@New.io", password: "longenough" });
assert.equal(u.email, "ada@new.io");
assert.equal(u.role, "viewer");
assert.equal(u.personId, u.id);
assert.throws(
  () => a.createUser({ name: "Ada New", email: "ada@new.io", password: "longenough" }),
  /already registered/
);
assert.throws(
  () => a.createUser({ name: "Bo", email: "not-an-email", password: "longenough" }),
  /valid email/
);
assert.throws(
  () => a.createUser({ name: "Bo", email: "bo@new.io", password: "short" }),
  /at least 8/
);
assert.throws(() => a.createUser({ name: "B", email: "b@new.io", password: "longenough" }), /full name/);
assert.equal(a.verifyCredentials("ada@new.io", "longenough")?.id, u.id);

// Sessions: create -> resolve -> destroy; unknown token resolves to null
const token = a.createSession(u.id);
assert.equal(a.getSessionUser(token)?.id, u.id);
a.destroySession(token);
assert.equal(a.getSessionUser(token), null);
assert.equal(a.getSessionUser("not-a-token"), null);

// Expired sessions are rejected and pruned
const stale = a.createSession(u.id);
a.getDb().prepare("UPDATE sessions SET expires_at = ? WHERE token = ?").run("2000-01-01T00:00:00.000Z", stale);
assert.equal(a.getSessionUser(stale), null);
assert.equal(a.getDb().prepare("SELECT 1 FROM sessions WHERE token = ?").get(stale), undefined);

// Redirect hardening (review finding: open redirect via ?next)
const { safeNext } = await import("../lib/redirect.ts");
assert.equal(safeNext("https://evil.com", "http://localhost:3000"), "/dashboard");
assert.equal(safeNext("//evil.com", "http://localhost:3000"), "/dashboard");
assert.equal(safeNext("/documents/d1", "http://localhost:3000"), "/documents/d1");
assert.equal(safeNext("/search?q=x", "http://localhost:3000"), "/search?q=x");
assert.equal(safeNext(null, "http://localhost:3000"), "/dashboard");

// Password length cap (review finding: unbounded scrypt input)
assert.throws(
  () => a.createUser({ name: "Max Length", email: "max@new.io", password: "x".repeat(400) }),
  /256/
);

/* ---------- owner role management ---------- */
const owner = a.verifyCredentials("maria.okafor@acme.com", a.SEED_PASSWORD);
assert.equal(owner?.role, "owner");

// owner promotes Tom (viewer, personId p4) to editor; persisted in the DB,
// and the returned user reflects the new role immediately
const promoted = a.changeUserRole(owner, "p4", "editor");
assert.equal(promoted.role, "editor", "returned user must carry the new role");
assert.equal(a.listUsers().find((u) => u.personId === "p4")?.role, "editor");
a.changeUserRole(owner, "p4", "viewer"); // revert for the rest of the suite

// guards: non-owner actor, unknown target, self-change
const tom = a.verifyCredentials("tom.beck@acme.com", a.SEED_PASSWORD);
assert.equal(tom?.role, "viewer");
assert.throws(() => a.changeUserRole(tom, "p1", "viewer"), /Only owners/);
assert.throws(() => a.changeUserRole(owner, "p9", "viewer"), /Member not found/);
assert.throws(() => a.changeUserRole(owner, "p1", "viewer"), /your own role/);

/* ---------- forgot / reset password ---------- */
// unknown email: ok, no dev link (no enumeration)
const ghost = a.createResetToken("ghost@acme.com");
assert.equal(ghost.ok, true);
assert.ok(!ghost.devResetUrl);

// known email: dev link carries a working token
const forgot = a.createResetToken("priya.nair@acme.com"); // p3
assert.ok(forgot.devResetUrl, "non-production must expose the reset link");
const resetToken = new URL(forgot.devResetUrl, "http://x").searchParams.get("token");
assert.equal(a.getUserForResetToken(resetToken)?.personId, "p3");

// expired token rejected
a.getDb().prepare("UPDATE resets SET expires_at = ? WHERE token = ?").run("2000-01-01T00:00:00.000Z", resetToken);
assert.equal(a.getUserForResetToken(resetToken), null);
assert.throws(() => a.resetPassword(resetToken, "newpassword1"), /expired|already been used/);

// fresh reset: new hash works, old password dead, all sessions killed
const fresh = a.createResetToken("maria.okafor@acme.com");
const freshToken = new URL(fresh.devResetUrl, "http://x").searchParams.get("token");
const sess = a.createSession("u-p1");
assert.equal(a.getSessionUser(sess)?.personId, "p1");
a.resetPassword(freshToken, "newpassword1");
assert.throws(() => a.resetPassword(freshToken, "newpassword1"), /expired|already been used/);
assert.equal(a.getSessionUser(sess), null, "reset must kill existing sessions");
assert.equal(a.verifyCredentials("maria.okafor@acme.com", "newpassword1")?.role, "owner");
assert.equal(a.verifyCredentials("maria.okafor@acme.com", a.SEED_PASSWORD), null, "old password must die");

console.log("auth check passed");
