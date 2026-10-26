import type { Role } from "@/lib/mock";

// Pure RBAC + retention rules — no React, no storage, so they can be unit-checked.
// ponytail: a flat role→permission table; add a matrix only when roles diverge per resource type.

export type Perm =
  | "create" | "edit" | "upload" | "delete" | "restore" | "purge" | "manage" | "retention";

const ROLE_PERMS: Record<Role, Perm[]> = {
  viewer: [],
  editor: ["create", "edit", "upload", "delete", "restore"],
  owner: ["create", "edit", "upload", "delete", "restore", "purge", "manage", "retention"],
};

export function canRole(role: Role, perm: Perm): boolean {
  return ROLE_PERMS[role].includes(perm);
}

/** Folder-level override wins over the workspace role. */
export function resolveRole(workspaceRole: Role, override?: Role): Role {
  return override ?? workspaceRole;
}

/** Whether a document last updated at `updatedAt` is past a `days`-day retention window. */
export function pastWindow(updatedAt: string, now: number, days?: number): boolean {
  if (!days) return false;
  return now - new Date(updatedAt).getTime() > days * 86400000;
}
