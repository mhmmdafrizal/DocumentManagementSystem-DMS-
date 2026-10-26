"use client";

import { peopleById } from "@/lib/mock";
import { purge, restoreFromTrash, useCan, useTrashDocs } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileBadge } from "@/components/dms/doc-table";
import { useState } from "react";

export default function TrashPage() {
  const items = useTrashDocs();
  const people = peopleById();
  const can = useCan();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const restoreSel = () => {
    selected.forEach((id) => restoreFromTrash(id));
    setSelected(new Set());
  };
  const purgeSel = () => {
    if (!confirm(`Permanently delete ${selected.size} item(s)? This cannot be undone.`)) return;
    selected.forEach((id) => purge(id));
    setSelected(new Set());
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Breadcrumbs items={[{ label: "Trash" }]} />
          <p className="mt-1 text-sm text-ink-500">
            Soft-deleted items are retained for 30 days before automatic purge.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={selected.size === 0 || !can("restore")}
            onClick={restoreSel}
          >
            Restore ({selected.size})
          </Button>
          <Button
            variant="danger-quiet"
            size="sm"
            disabled={selected.size === 0 || !can("purge")}
            onClick={purgeSel}
          >
            Purge ({selected.size})
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Trash is empty" body="Nothing is permanently deleted accidentally." />
      ) : (
        <div className="rounded-radius-lg border border-ink-200 bg-ink-0 shadow-sm">
          <table className="w-full text-left text-13">
            <thead>
              <tr className="micro-label border-b border-ink-200">
                <th className="w-9 px-3 py-2">
                  <Checkbox
                    label="Select all"
                    checked={selected.size === items.length}
                    indeterminate={selected.size > 0 && selected.size < items.length}
                    onChange={(e) => setSelected(e.target.checked ? new Set(items.map((d) => d.id)) : new Set())}
                  />
                </th>
                <th className="px-2 py-2 font-normal">Document</th>
                <th className="hidden px-2 py-2 font-normal md:table-cell">Deleted by</th>
                <th className="px-2 py-2 font-normal">Deleted at</th>
                <th className="px-2 py-2 font-normal">Restorable until</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => {
                const delBy = doc.deletedBy ? people[doc.deletedBy] : null;
                const delAt = doc.deletedAt ? new Date(doc.deletedAt) : null;
                const restoreBy = delAt ? new Date(delAt.getTime() + 30 * 86400000) : null;
                return (
                  <tr key={doc.id} className="border-b border-ink-100 hover:bg-ink-50">
                    <td className="px-3 py-2.5">
                      <Checkbox
                        label={`Select ${doc.title}`}
                        checked={selected.has(doc.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(doc.id); else next.delete(doc.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <FileBadge type={doc.fileType} size="sm" />
                        <span className="truncate text-13 font-medium text-ink-800">{doc.title}</span>
                      </div>
                    </td>
                    <td className="hidden px-2 py-2.5 text-ink-600 md:table-cell">{delBy?.name ?? "—"}</td>
                    <td className="px-2 py-2.5 text-xs tabular text-ink-600">
                      {delAt ? delAt.toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-xs tabular text-ink-600">
                      {restoreBy ? restoreBy.toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}