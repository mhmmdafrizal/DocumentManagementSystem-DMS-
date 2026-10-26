"use client";

import { useSyncExternalStore } from "react";
import {
  AuthUserLite,
  DocVersion,
  Document,
  Folder,
  Person,
  Role,
  currentUser,
  documents as seedDocs,
  folders as seedFolders,
  people,
  recentActivity,
  versionsFor,
} from "@/lib/mock";

// ponytail: one localStorage store for the whole prototype. Per-browser, not
// shared, no DB. Swap for an API + DB when multi-user persistence is needed.

export interface RetentionPolicy {
  mode: "keep" | "archive" | "purge";
  archiveDays?: number;
  purgeDays?: number;
}

type AuditAction =
  | "upload" | "edit" | "version" | "restore" | "delete"
  | "restore-trash" | "purge" | "create" | "retention" | "permission";

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  action: AuditAction;
  entityType: "document" | "folder" | "member";
  entityId: string;
  before?: unknown;
  after?: unknown;
}

interface Membership {
  personId: string;
  role: Role;
}

interface StoreState {
  folders: Folder[];
  docs: Document[];
  versions: Record<string, DocVersion[]>;
  members: Membership[];
  /** per-folder role overrides, keyed folderId → personId → role */
  folderRoles: Record<string, Record<string, Role>>;
  retention: Record<string, RetentionPolicy>;
  audit: AuditEntry[];
  actingUserId: string;
}

const KEY = "dms.store.v1";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? "System";

function seedAudit(): AuditEntry[] {
  return recentActivity.map((a, i) => ({
    id: `seed-${i}`,
    at: a.at,
    actorId: a.whoId,
    action: a.kind,
    entityType: "document",
    entityId: a.docId,
    after: { detail: a.detail },
  }));
}

function initialState(): StoreState {
  const versions: Record<string, DocVersion[]> = {};
  for (const d of seedDocs) versions[d.id] = versionsFor(d.id);
  return {
    folders: seedFolders.map((f) => ({ ...f })),
    docs: seedDocs.map((d) => ({ ...d })),
    versions,
    members: people.map((p) => ({ personId: p.id, role: p.role })),
    folderRoles: {},
    retention: {},
    audit: seedAudit(),
    actingUserId: currentUser.id,
  };
}

const SERVER_STATE = initialState();

let state: StoreState | null = null;
const listeners = new Set<() => void>();

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as StoreState) };
  } catch {
    /* corrupt storage → fall through to seed */
  }
  return initialState();
}

function getState(): StoreState {
  if (state === null) state = load();
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: StoreState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota/unavailable → keep in-memory */
  }
  listeners.forEach((l) => l());
}

function entry(
  s: StoreState,
  action: AuditAction,
  entityType: AuditEntry["entityType"],
  entityId: string,
  before?: unknown,
  after?: unknown
): AuditEntry[] {
  return [
    ...s.audit,
    { id: `a-${uid()}`, at: new Date().toISOString(), actorId: s.actingUserId, action, entityType, entityId, before, after },
  ];
}

/* ---------- hooks ---------- */

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
}

export function useFolders(): Folder[] {
  return useStore().folders;
}

/* ---------- folder actions ---------- */

export function addFolder(name: string, parentId: string | null = null): Folder {
  const s = getState();
  const folder: Folder = {
    id: `f-${uid()}`,
    name: name.trim(),
    parentId,
  };
  commit({
    ...s,
    folders: [...s.folders, folder],
    audit: entry(s, "create", "folder", folder.id, undefined, { name: folder.name }),
  });
  return folder;
}

/* ---------- document actions ---------- */

interface NewDocument {
  title: string;
  description: string;
  folderId: string | null;
  fileType: Document["fileType"];
  tags: string[];
  category: string;
}

export function addDocument(input: NewDocument): Document {
  const s = getState();
  const now = new Date().toISOString();
  const doc: Document = {
    id: `d-${uid()}`,
    title: input.title,
    description: input.description,
    folderId: input.folderId,
    ownerId: s.actingUserId,
    fileType: input.fileType,
    version: 1,
    tags: input.tags,
    category: input.category,
    updatedAt: now,
  };
  const v1: DocVersion = {
    no: 1, authorId: s.actingUserId, createdAt: now,
    changeSummary: "Initial upload", size: "—", pinned: false,
    user: nameOf(s.actingUserId),
  };
  commit({
    ...s,
    docs: [...s.docs, doc],
    versions: { ...s.versions, [doc.id]: [v1] },
    audit: entry(s, "upload", "document", doc.id, undefined, { title: doc.title, folderId: doc.folderId }),
  });
  return doc;
}

export function softDelete(docId: string) {
  const s = getState();
  const doc = s.docs.find((d) => d.id === docId);
  if (!doc || doc.deletedAt) return;
  commit({
    ...s,
    docs: s.docs.map((d) =>
      d.id === docId ? { ...d, deletedAt: new Date().toISOString(), deletedBy: s.actingUserId } : d
    ),
    audit: entry(s, "delete", "document", docId, { deletedAt: undefined }, { deletedAt: new Date().toISOString() }),
  });
}

export function restoreFromTrash(docId: string) {
  const s = getState();
  const doc = s.docs.find((d) => d.id === docId);
  if (!doc || !doc.deletedAt) return;
  commit({
    ...s,
    docs: s.docs.map((d) => (d.id === docId ? { ...d, deletedAt: undefined, deletedBy: undefined } : d)),
    audit: entry(s, "restore-trash", "document", docId, { deletedAt: doc.deletedAt }, { deletedAt: undefined }),
  });
}

export function purge(docId: string) {
  const s = getState();
  const doc = s.docs.find((d) => d.id === docId);
  if (!doc) return;
  const versions = { ...s.versions };
  delete versions[docId];
  commit({
    ...s,
    docs: s.docs.filter((d) => d.id !== docId),
    versions,
    audit: entry(s, "purge", "document", docId, { title: doc.title }, undefined),
  });
}

export function restoreVersion(docId: string, versionNo: number) {
  const s = getState();
  const doc = s.docs.find((d) => d.id === docId);
  const list = s.versions[docId];
  if (!doc || !list || !list.some((v) => v.no === versionNo)) return;
  const nextNo = Math.max(...list.map((v) => v.no)) + 1;
  const now = new Date().toISOString();
  const v: DocVersion = {
    no: nextNo, authorId: s.actingUserId, createdAt: now,
    changeSummary: `Restored from v${versionNo}`, size: "—", pinned: false,
    isRestore: true, user: nameOf(s.actingUserId),
  };
  commit({
    ...s,
    docs: s.docs.map((d) => (d.id === docId ? { ...d, version: nextNo, updatedAt: now } : d)),
    versions: { ...s.versions, [docId]: [v, ...list] },
    audit: entry(s, "restore", "document", docId, { from: versionNo }, { version: nextNo }),
  });
}

/* ---------- governance actions ---------- */

export function setRetention(folderId: string, policy: RetentionPolicy) {
  const s = getState();
  commit({
    ...s,
    retention: { ...s.retention, [folderId]: policy },
    audit: entry(s, "retention", "folder", folderId, s.retention[folderId], policy),
  });
}

export function setMemberRole(personId: string, role: Role) {
  const s = getState();
  const prev = s.members.find((m) => m.personId === personId)?.role;
  commit({
    ...s,
    members: s.members.map((m) => (m.personId === personId ? { ...m, role } : m)),
    audit: entry(s, "permission", "member", personId, { role: prev }, { role }),
  });
}

export function setActingUser(personId: string) {
  commit({ ...getState(), actingUserId: personId });
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Merge backend accounts into the local People/RBAC tables so roleOf(),
 * useActingUser() and audit rendering agree with the DB.
 * ponytail: `people.push` mutates the mock array in memory only; re-run on
 * every app boot.
 * App data stays local: only NEW memberships are added (role from the DB);
 * existing member roles set in Settings → Members are never overwritten.
 */
export function syncAuthUsers(users: AuthUserLite[]) {
  const s = getState();
  for (const u of users) {
    if (!people.some((p) => p.id === u.personId)) {
      people.push({ id: u.personId, name: u.name, initials: initialsOf(u.name), role: u.role });
    }
  }
  const additions = users
    .filter((u) => !s.members.some((m) => m.personId === u.personId))
    .map((u) => ({ personId: u.personId, role: u.role }));
  if (additions.length) commit({ ...s, members: [...s.members, ...additions] });
}

export function setFolderRole(folderId: string, personId: string, role: Role) {
  const s = getState();
  const prev = s.folderRoles[folderId]?.[personId];
  commit({
    ...s,
    folderRoles: { ...s.folderRoles, [folderId]: { ...s.folderRoles[folderId], [personId]: role } },
    audit: entry(s, "permission", "member", personId, { folderId, role: prev }, { folderId, role }),
  });
}

/* ---------- permissions (FR-2) ---------- */

import { canRole, resolveRole, type Perm } from "@/lib/perms";

export function roleOf(s: StoreState, personId: string, folderId?: string | null): Role {
  const workspaceRole = s.members.find((m) => m.personId === personId)?.role ?? "viewer";
  return resolveRole(workspaceRole, folderId ? s.folderRoles[folderId]?.[personId] : undefined);
}

/* ---------- selectors ---------- */

export function useLiveDocs(): Document[] {
  return useStore().docs.filter((d) => !d.deletedAt);
}

export function useTrashDocs(): Document[] {
  return useStore().docs.filter((d) => d.deletedAt);
}

export function useDoc(id: string): Document | undefined {
  return useStore().docs.find((d) => d.id === id);
}

export function useVersions(id: string): DocVersion[] {
  return useStore().versions[id] ?? [];
}

export function useMembers(): Membership[] {
  return useStore().members;
}

export function useMembersById(): Record<string, Person> {
  const by: Record<string, Person> = {};
  for (const p of people) by[p.id] = p;
  return by;
}

export function useAudit(): AuditEntry[] {
  return useStore().audit;
}

export function useActingUser(): Person {
  const s = useStore();
  return people.find((p) => p.id === s.actingUserId) ?? people[0];
}

/** Whether the signed-in user may perform `perm` (optionally within a folder). */
export function useCan(folderId?: string | null): (perm: Perm) => boolean {
  const s = useStore();
  const role = roleOf(s, s.actingUserId, folderId);
  return (perm) => canRole(role, perm);
}
