import assert from "node:assert/strict";
import { canRole, resolveRole, pastWindow } from "../lib/perms.ts";

// viewer is read-only
assert.equal(canRole("viewer", "upload"), false);
assert.equal(canRole("viewer", "create"), false);

// editor can upload/edit/delete, but not purge or manage
assert.equal(canRole("editor", "upload"), true);
assert.equal(canRole("editor", "delete"), true);
assert.equal(canRole("editor", "purge"), false);
assert.equal(canRole("editor", "manage"), false);

// owner can everything
for (const p of ["create", "edit", "upload", "delete", "restore", "purge", "manage", "retention"]) {
  assert.equal(canRole("owner", p), true, `owner should have ${p}`);
}

// folder-level override wins over the workspace role
assert.equal(resolveRole("viewer", "editor"), "editor");
assert.equal(resolveRole("viewer", undefined), "viewer");
assert.equal(resolveRole("owner", "viewer"), "viewer");

// retention window math
const now = Date.parse("2026-10-10T00:00:00Z");
assert.equal(pastWindow("2025-01-01T00:00:00Z", now, 30), true);
assert.equal(pastWindow("2026-10-09T00:00:00Z", now, 30), false);
assert.equal(pastWindow("2000-01-01T00:00:00Z", now, undefined), false);

console.log("perms check passed");
