export type Role = "owner" | "editor" | "viewer";
export type FileType = "pdf" | "docx" | "xlsx" | "png" | "jpg" | "txt" | "md";

/** Client-safe view of a backend account (lib/auth.ts stays server-only). */
export interface AuthUserLite {
  id: string;
  email: string;
  name: string;
  role: Role;
  personId: string;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: Role;
}

export interface DocVersion {
  no: number;
  authorId: string;
  createdAt: string;
  changeSummary: string;
  size: string;
  pinned: boolean;
  isRestore?: boolean;
  user?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  folderId: string | null;
  ownerId: string;
  fileType: FileType;
  version: number;
  tags: string[];
  category: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Workspace {
  id: string;
  name: string;
}

export const people: Person[] = [
  { id: "p1", name: "Maria Okafor", initials: "MO", role: "owner" },
  { id: "p2", name: "Devon Reyes", initials: "DR", role: "owner" },
  { id: "p3", name: "Priya Nair", initials: "PN", role: "editor" },
  { id: "p4", name: "Tom Beck", initials: "TB", role: "viewer" },
  { id: "p5", name: "Ana Sofia Lima", initials: "AL", role: "editor" },
];

export const currentUser = people[0];

export const workspaces: Workspace[] = [
  { id: "w1", name: "Acme Corp — Operations" },
];

export const folders: Folder[] = [
  { id: "f-contracts", name: "Contracts", parentId: null },
  { id: "f-legal", name: "Legal", parentId: null },
  { id: "f-hr", name: "HR", parentId: null },
  { id: "f-finance", name: "Finance", parentId: null },
  { id: "f-partnerships", name: "Partnerships", parentId: "f-contracts" },
  { id: "f-sales", name: "Sales 2026", parentId: "f-contracts" },
];

export function peopleById(): Record<string, Person> {
  return Object.fromEntries(people.map((p) => [p.id, p]));
}

const byPerson = (id: string) => {
  const by = peopleById();
  return by[id]?.name ?? "System";
};

function mkVersion(
  no: number,
  authorId: string,
  createdAt: string,
  changeSummary: string,
  size: string,
  pinned: boolean,
  isRestore?: boolean
): DocVersion {
  return { no, authorId, createdAt, changeSummary, size, pinned, isRestore, user: byPerson(authorId) };
}

const versionSets: Record<string, DocVersion[]> = {
  "d-master-sla": [
    mkVersion(5, "p3", "2026-08-21T10:04:00Z", "Updated renewal terms per 2027 negotiation", "412 KB", true),
    mkVersion(4, "p1", "2026-07-02T14:30:00Z", "Added compliance annex A", "402 KB", false),
    mkVersion(3, "p5", "2026-05-18T09:12:00Z", "Restored from v2 — wrong market rate applied", "388 KB", false, true),
    mkVersion(2, "p3", "2026-04-30T16:45:00Z", "Revised liability cap", "385 KB", false),
    mkVersion(1, "p1", "2026-02-11T11:20:00Z", "Initial upload", "350 KB", false),
  ],
  "d-privacy-policy": [
    mkVersion(3, "p5", "2026-07-30T08:00:00Z", "GDPR erasure wording", "260 KB", false),
    mkVersion(2, "p1", "2026-03-15T13:22:00Z", "Marketing consent section", "254 KB", false),
    mkVersion(1, "p1", "2025-11-02T10:00:00Z", "Initial upload", "248 KB", false),
  ],
  "d-vendor-rfp": [
    mkVersion(2, "p3", "2026-08-10T15:10:00Z", "Scoring rubric added", "1.1 MB", false),
    mkVersion(1, "p3", "2026-08-01T09:00:00Z", "Initial upload", "1.0 MB", false),
  ],
  "d-q3-board": [
    mkVersion(4, "p2", "2026-08-28T18:00:00Z", "Final figures locked", "2.3 MB", true),
    mkVersion(3, "p2", "2026-08-20T17:30:00Z", "Updated after audit findings", "2.2 MB", false),
    mkVersion(2, "p2", "2026-08-12T12:00:00Z", "Added risk register", "2.1 MB", false),
    mkVersion(1, "p2", "2026-08-05T10:00:00Z", "Initial upload", "2.0 MB", false),
  ],
};

export const documents: Document[] = [
  {
    id: "d-master-sla", title: "Master Services Agreement — Zephyr Tech",
    description: "Primary outsourced infrastructure provider contract.", folderId: "f-contracts",
    ownerId: "p1", fileType: "pdf", version: 5, tags: ["contract", "legal", "audit"],
    category: "Signed contract", updatedAt: "2026-08-21T10:04:00Z",
  },
  {
    id: "d-vendor-rfp", title: "Vendor RFP — CRM Evaluation",
    description: "Scoring criteria and vendor submissions.", folderId: "f-contracts",
    ownerId: "p3", fileType: "docx", version: 2, tags: ["contract", "finance"],
    category: "Procurement", updatedAt: "2026-08-10T15:10:00Z",
  },
  {
    id: "d-partner-mou", title: "MOU — Northwind Logistics",
    description: "Draft memorandum of understanding.", folderId: "f-partnerships",
    ownerId: "p1", fileType: "pdf", version: 1, tags: ["contract"],
    category: "Draft", updatedAt: "2026-09-01T09:30:00Z",
  },
  {
    id: "d-privacy-policy", title: "Customer Data Privacy Policy",
    description: "Policies for handling customer PII, current revision.", folderId: "f-legal",
    ownerId: "p1", fileType: "md", version: 3, tags: ["legal", "policy", "audit"],
    category: "Published policy", updatedAt: "2026-07-30T08:00:00Z",
  },
  {
    id: "d-nda-2026", title: "NDA — Rolling, 2026",
    description: "Mutual NDA template for all partnerships.", folderId: "f-legal",
    ownerId: "p5", fileType: "docx", version: 1, tags: ["legal"],
    category: "Template", updatedAt: "2026-06-19T12:45:00Z",
  },
  {
    id: "d-hr-handbook", title: "Employee Handbook 2026",
    description: "Remote-work policy, benefits, code of conduct.", folderId: "f-hr",
    ownerId: "p3", fileType: "pdf", version: 2, tags: ["hr", "policy"],
    category: "Published policy", updatedAt: "2026-08-02T10:00:00Z",
  },
  {
    id: "d-perf-review", title: "Performance Review Process",
    description: "Internal procedure for quarterly reviews.", folderId: "f-hr",
    ownerId: "p1", fileType: "md", version: 1, tags: ["hr"],
    category: "Procedure", updatedAt: "2026-05-28T14:00:00Z",
  },
  {
    id: "d-q3-board", title: "Q3 Board Report",
    description: "Quarterly performance deck with audit trail.", folderId: "f-finance",
    ownerId: "p2", fileType: "xlsx", version: 4, tags: ["finance", "audit"],
    category: "Report", updatedAt: "2026-08-28T18:00:00Z",
  },
  {
    id: "d-budget-2027", title: "Budget Plan 2027",
    description: "Annual budget planning workbook.", folderId: "f-finance",
    ownerId: "p2", fileType: "xlsx", version: 1, tags: ["finance"],
    category: "Working doc", updatedAt: "2026-09-05T11:15:00Z",
  },
  {
    id: "d-old-employee", title: "Handbook 2024 (superseded)",
    description: "Legacy handbook, kept for audit reference.", folderId: "f-hr",
    ownerId: "p5", fileType: "pdf", version: 1, tags: ["hr"],
    category: "Archive", updatedAt: "2026-03-01T09:00:00Z",
    deletedAt: "2026-09-06T10:12:00Z", deletedBy: "p3",
  },
];

function docById(id: string): Document | undefined {
  return documents.find((d) => d.id === id);
}

export function versionsFor(docId: string): DocVersion[] {
  const v = versionSets[docId];
  if (v) return v;
  const date = docById(docId)?.updatedAt ?? "2026-01-01T00:00:00Z";
  return [mkVersion(1, docById(docId)?.ownerId ?? "p1", date, "Initial upload", "250 KB", false)];
}

export function fileTypeLabel(t: FileType): string {
  return t === "docx" ? "DOCX" : t.toUpperCase();
}

/* Recent activity feed for dashboard (S3) */
export const recentActivity: { kind: "upload" | "edit" | "version" | "restore" | "delete"; whoId: string; docId: string; at: string; detail: string }[] = [
  { kind: "restore", whoId: "p1", docId: "d-master-sla", at: "2026-09-12T09:40:00Z", detail: "Restored v3 as new version" },
  { kind: "edit", whoId: "p3", docId: "d-budget-2027", at: "2026-09-11T16:20:00Z", detail: "Edited in real time" },
  { kind: "upload", whoId: "p5", docId: "d-nda-2026", at: "2026-09-10T11:05:00Z", detail: "Uploaded new version" },
  { kind: "delete", whoId: "p3", docId: "d-old-employee", at: "2026-09-06T10:12:00Z", detail: "Moved to Trash" },
];

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
