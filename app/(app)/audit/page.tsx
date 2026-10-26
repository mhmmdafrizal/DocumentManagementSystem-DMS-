"use client";

import { useMemo, useState } from "react";
import { fullDate, people, peopleById } from "@/lib/mock";
import { AuditEntry, useAudit, useCan, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Select, Input } from "@/components/ui/field";

const ACTIONS: AuditEntry["action"][] = [
  "upload", "edit", "version", "restore", "delete", "restore-trash", "purge", "create", "retention", "permission",
];

const summarize = (v: unknown) => {
  if (v == null) return "—";
  const json = JSON.stringify(v);
  return json.length > 60 ? `${json.slice(0, 57)}…` : json;
};

export default function AuditPage() {
  const audit = useAudit();
  const s = useStore();
  const can = useCan();
  const peopleMap = peopleById();

  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [q, setQ] = useState("");

  const targetOf = (a: AuditEntry) => {
    if (a.entityType === "document") {
      const doc = s.docs.find((d) => d.id === a.entityId);
      const after = a.after as { title?: string } | undefined;
      return doc?.title ?? after?.title ?? a.entityId;
    }
    if (a.entityType === "folder") {
      const folder = s.folders.find((f) => f.id === a.entityId);
      const after = a.after as { name?: string } | undefined;
      return folder?.name ?? after?.name ?? a.entityId;
    }
    return peopleMap[a.entityId]?.name ?? a.entityId;
  };

  const rows = useMemo(() => {
    const low = q.trim().toLowerCase();
    return audit
      .slice()
      .reverse()
      .filter((a) => (actor ? a.actorId === actor : true))
      .filter((a) => (action ? a.action === action : true))
      .filter((a) => (entity ? a.entityType === entity : true))
      .filter((a) =>
        low
          ? `${peopleMap[a.actorId]?.name ?? ""} ${a.action} ${targetOf(a)}`.toLowerCase().includes(low)
          : true
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit, actor, action, entity, q]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Breadcrumbs items={[{ label: "Audit log" }]} />
      <h1 className="mt-3 text-xl font-semibold text-ink-900">Audit log</h1>
      <p className="mt-1 text-sm text-ink-500">
        Append-only record of every action. Entries cannot be edited or deleted.
      </p>

      {!can("manage") && (
        <div className="mt-4">
          <Notice tone="warning" title="Restricted">
            The audit log is visible to owners and administrators.
          </Notice>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Select aria-label="Filter by actor" value={actor} onChange={(e) => setActor(e.target.value)}>
          <option value="">All actors</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select aria-label="Filter by action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select aria-label="Filter by entity" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All entities</option>
          <option value="document">Document</option>
          <option value="folder">Folder</option>
          <option value="member">Member</option>
        </Select>
        <Input aria-label="Search audit log" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-2 flex items-center justify-between border-b border-ink-200 pb-1.5">
        <span className="micro-label">Entries</span>
        <span className="drawing-no text-[11px] text-ink-400">{String(rows.length).padStart(2, "0")}</span>
      </div>

      {rows.length ? (
        <div className="mt-2 overflow-x-auto rounded-radius-lg border border-ink-200 bg-ink-0 shadow-sm">
          <table className="w-full min-w-[720px] text-left text-13">
            <thead>
              <tr className="micro-label border-b border-ink-200">
                <th className="px-3 py-2 font-normal">Time (UTC)</th>
                <th className="px-3 py-2 font-normal">Actor</th>
                <th className="px-3 py-2 font-normal">Action</th>
                <th className="px-3 py-2 font-normal">Entity</th>
                <th className="px-3 py-2 font-normal">Target</th>
                <th className="px-3 py-2 font-normal">Before → after</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-ink-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-ink-500">
                    {new Date(a.at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-800">{peopleMap[a.actorId]?.name ?? "System"}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-600">{a.action}</td>
                  <td className="px-3 py-2.5 capitalize text-ink-600">{a.entityType}</td>
                  <td className="max-w-56 truncate px-3 py-2.5 text-ink-800" title={targetOf(a)}>{targetOf(a)}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-ink-500">
                    {summarize(a.before)} → {summarize(a.after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No entries match" body="Adjust the filters to see more of the audit trail." />
        </div>
      )}

      <p className="mt-3 text-xs text-ink-400">
        Full timestamps are stored in UTC; the display above is {fullDate(new Date().toISOString()).split(",")[0]} local time.
      </p>
    </div>
  );
}
