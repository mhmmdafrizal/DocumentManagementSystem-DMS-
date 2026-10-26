"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { peopleById, timeAgo } from "@/lib/mock";
import { useActingUser, useLiveDocs, useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Notice } from "@/components/ui/notice";
import { VersionBadge } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { FileBadge } from "@/components/dms/doc-table";
import { RevTriangle } from "@/components/ui/rev";

const SESSION_NOW = Date.now();

const kindLabel: Record<string, string> = {
  upload: "UPLOAD",
  edit: "EDIT",
  version: "VERSION",
  restore: "RESTORE",
  delete: "DELETE",
  "restore-trash": "RESTORE",
  purge: "PURGE",
  create: "CREATE",
  retention: "RETENTION",
  permission: "PERMISSION",
};

function actionVerb(action: string) {
  switch (action) {
    case "upload": return "uploaded";
    case "edit": return "edited";
    case "version": return "revised";
    case "restore": return "restored a version of";
    case "delete": return "moved to trash";
    case "restore-trash": return "restored";
    case "purge": return "permanently deleted";
    case "create": return "created";
    case "retention": return "changed retention on";
    case "permission": return "changed access on";
    default: return "updated";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const acting = useActingUser();
  const s = useStore();
  const docs = useLiveDocs();
  const people = peopleById();

  const recent = docs.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const activity = s.audit.slice(-6).reverse();

  const now = SESSION_NOW;
  const policyFor = (folderId: string | null) => (folderId ? s.retention[folderId] : undefined);
  const purgeDue = docs.filter((d) => {
    const p = policyFor(d.folderId);
    return !!p?.purgeDays && now - new Date(d.updatedAt).getTime() > p.purgeDays * 86400000;
  }).length;
  const archiveSoon = s.folders.filter((f) => {
    const p = s.retention[f.id];
    const days = p?.mode === "archive" ? p.archiveDays : p?.mode === "purge" ? p.purgeDays : undefined;
    return days != null && days <= 30;
  }).length;
  const noPolicy = s.folders.filter((f) => !s.retention[f.id]).length;

  const radar = [
    { label: "Purge due this week", count: purgeDue, tone: "danger" as const },
    { label: "Auto-archive within 30d", count: archiveSoon, tone: "warning" as const },
    { label: "Folders without a policy", count: noPolicy, tone: "warning" as const },
  ];

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        <header>
          <p className="micro-label">Operations register</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            Welcome back, {acting.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-500">Every controlled document, its revision, and who touched it — in one register.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          {radar.map((r) => (
            <div
              key={r.label}
              className={`change-bar flex items-center justify-between rounded-radius-sm border bg-ink-0 px-4 py-3 shadow-sm ${
                r.tone === "danger" ? "border-revision/40" : "border-ink-200"
              }`}
            >
              <span className="pl-2 text-13 font-medium text-ink-800">{r.label}</span>
              <span
                className={`tabular text-2xl font-semibold ${
                  r.tone === "danger" ? "text-revision" : "text-warning-600"
                }`}
              >
                {r.count}
              </span>
            </div>
          ))}
        </section>

        <section>
          <h2 className="micro-label">Revision log</h2>
          <div className="mt-2 overflow-hidden rounded-radius-sm border border-ink-200 bg-ink-0 shadow-sm">
            {activity.map((a) => {
              const who = people[a.actorId];
              const doc = a.entityType === "document" ? docs.find((d) => d.id === a.entityId) : undefined;
              const folder = a.entityType === "folder" ? s.folders.find((f) => f.id === a.entityId) : undefined;
              const after = a.after as { title?: string; name?: string; detail?: string } | undefined;
              const member = a.entityType === "member" ? people[a.entityId] : undefined;
              const subject =
                doc?.title ?? folder?.name ?? member?.name ?? after?.title ?? after?.name ?? after?.detail;
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-ink-100 px-3 py-2.5 last:border-0">
                  <Avatar person={who} size="sm" />
                  <span className="w-16 shrink-0 font-mono text-[10px] tracking-[0.12em] text-ink-500">
                    {kindLabel[a.action] ?? a.action.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-13 text-ink-700">
                    <span className="font-medium text-ink-800">{who?.name ?? "System"}</span> {actionVerb(a.action)}
                    {subject && (
                      <>
                        {" — "}
                        <span className="font-medium text-primary-700">{subject}</span>
                      </>
                    )}
                  </span>
                  <span className="shrink-0 tabular text-xs text-ink-400">{timeAgo(a.at)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="micro-label">Recently revised</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/search")}
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
            >
              View all
            </Button>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {recent.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="group flex items-center gap-3 rounded-radius-sm border border-ink-200 bg-ink-0 px-3 py-2.5 shadow-sm transition-colors hover:bg-ink-25"
              >
                <FileBadge type={doc.fileType} size="sm" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-13 font-medium text-ink-800 group-hover:text-primary-700">{doc.title}</span>
                  <span className="block truncate text-xs text-ink-500">{people[doc.ownerId]?.name} · {doc.category}</span>
                </div>
                <RevTriangle n={doc.version} className={`h-4 w-4 shrink-0 ${doc.version > 1 ? "text-revision" : "text-ink-300"}`} />
                <VersionBadge no={doc.version} />
                <span className="hidden tabular text-xs text-ink-400 md:block">{timeAgo(doc.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </section>

        <Notice tone="info" title="Workspace health">
          You have <span className="font-medium text-ink-900">{docs.length} active documents</span> across {s.folders.length} folders.{" "}
          {noPolicy} {noPolicy === 1 ? "folder has" : "folders have"} no retention policy set.
        </Notice>
      </div>
    </div>
  );
}
