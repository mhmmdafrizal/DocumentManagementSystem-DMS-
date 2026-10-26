"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Document, FileType, peopleById, fileTypeLabel, timeAgo } from "@/lib/mock";
import { softDelete, useCan } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import { RevTriangle } from "@/components/ui/rev";
import { Menu } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

const dmsNo = (id: string) => `DMS-${id.replace(/^d-/, "").toUpperCase()}`;

export function downloadDoc(doc: Document) {
  const body =
    `${doc.title}\n${dmsNo(doc.id)}\nRev ${String(doc.version).padStart(2, "0")}\n` +
    `Owner: ${peopleById()[doc.ownerId]?.name ?? "—"}\nUpdated: ${doc.updatedAt}\n\n${doc.description}\n\n` +
    "(Prototype placeholder — no real file is stored.)";
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.title.replace(/[^\w.-]+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

type Column = "title" | "rev" | "owner" | "tags" | "updated";

const columns: { id: Column; label: string; sortable: boolean; hideBelow?: string }[] = [
  { id: "title", label: "Document", sortable: true },
  { id: "rev", label: "Rev", sortable: true },
  { id: "owner", label: "Owner", sortable: true, hideBelow: "md" },
  { id: "tags", label: "Tags", sortable: false, hideBelow: "md" },
  { id: "updated", label: "Updated", sortable: true },
];

export function DocTable({ docs }: { docs: Document[] }) {
  const [sort, setSort] = useState<{ id: Column; dir: "asc" | "desc" }>({ id: "updated", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const can = useCan();
  const canDelete = can("delete");

  const people = peopleById();

  const sorted = useMemo(() => {
    const arr = [...docs];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sort.id) {
        case "title":
          av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break;
        case "rev":
          av = a.version; bv = b.version; break;
        case "owner":
          av = people[a.ownerId]?.name ?? ""; bv = people[b.ownerId]?.name ?? ""; break;
        case "updated":
          av = a.updatedAt; bv = b.updatedAt; break;
        default:
          return 0;
      }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [docs, sort, people]);

  const toggleColumn = (id: Column) => {
    setSort((s) => (s.id === id ? { id, dir: s.dir === "asc" ? "desc" : "asc" } : { id, dir: "asc" }));
  };

  const allSelected = docs.length > 0 && selected.size === docs.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div>
      {canDelete && selected.size > 0 && (
        <div className="flex items-center gap-3 border-b border-ink-200 bg-primary-50/60 px-3 py-2">
          <span className="text-13 text-ink-700">{selected.size} selected</span>
          <Button
            size="sm"
            variant="danger-quiet"
            onClick={() => {
              selected.forEach((id) => softDelete(id));
              setSelected(new Set());
            }}
          >
            Move to trash
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left">
        <thead>
          <tr className="border-b border-ink-200 text-ink-500">
            <th className="w-9 px-3 py-2">
              <Checkbox
                label="Select all documents"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => setSelected(e.target.checked ? new Set(docs.map((d) => d.id)) : new Set())}
              />
            </th>
            <th className="micro-label w-8 py-2 pr-2 font-normal">No.</th>
            {columns.map((c) => (
              <th
                key={c.id}
                aria-sort={sort.id === c.id ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                className={`micro-label px-2 py-2 font-normal ${c.hideBelow ? `hidden ${c.hideBelow}:table-cell` : ""}`}
              >
                {c.sortable ? (
                  <button
                    onClick={() => toggleColumn(c.id)}
                    className="group inline-flex items-center gap-1 hover:text-ink-800"
                  >
                    {c.label}
                    <svg
                      className={`h-3 w-3 transition-opacity ${sort.id === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
                      viewBox="0 0 16 16" fill="currentColor" aria-hidden
                    >
                      <path d={sort.id === c.id && sort.dir === "asc" ? "M8 4l4 5H4l4-5z" : "M8 12L4 7h8l-4 5z"} />
                    </svg>
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
            <th className="w-10 px-2" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((doc, i) => {
            const owner = people[doc.ownerId];
            const isSelected = selected.has(doc.id);
            const revised = doc.version > 1;
            return (
              <tr
                key={doc.id}
                className={`group border-b border-ink-100 transition-colors hover:bg-ink-25 ${isSelected ? "bg-primary-50/60" : ""}`}
              >
                <td className="px-3 py-2.5 align-top">
                  <Checkbox
                    label={`Select ${doc.title}`}
                    checked={isSelected}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(doc.id);
                      else next.delete(doc.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td className="py-2.5 pr-2 align-top">
                  <span className="drawing-no text-[11px] text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                </td>
                <td className={`py-2.5 pl-3 pr-2 ${revised ? "change-bar" : ""}`}>
                  <Link href={`/documents/${doc.id}`} className="flex min-w-0 items-start gap-2.5">
                    <FileBadge type={doc.fileType} />
                    <span className="min-w-0">
                      <span className="block truncate text-13 font-medium text-ink-800 group-hover:text-primary-700">
                        {doc.title}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{doc.description}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-2 py-2.5 align-top">
                  <span className="flex items-center gap-1.5">
                    <RevTriangle
                      n={doc.version}
                      className={`h-4 w-4 shrink-0 ${revised ? "text-revision" : "text-ink-300"}`}
                    />
                    <span className="drawing-no text-13 text-ink-600">{String(doc.version).padStart(2, "0")}</span>
                  </span>
                </td>
                <td className="hidden px-2 py-2.5 text-13 text-ink-600 md:table-cell">
                  {owner?.name}
                </td>
                <td className="hidden px-2 py-2.5 md:table-cell">
                  <span className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded-radius-sm bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                        {t}
                      </span>
                    ))}
                    {doc.tags.length > 2 && <span className="text-xs text-ink-400">+{doc.tags.length - 2}</span>}
                  </span>
                </td>
                <td className="px-2 py-2.5 align-top tabular text-13 text-ink-600">{timeAgo(doc.updatedAt)}</td>
                <td className="px-2 py-2.5 text-right align-top">
                  <Menu
                    label={`Actions for ${doc.title}`}
                    items={[
                      { label: "Download", onSelect: () => downloadDoc(doc) },
                      { label: "Copy DMS number", onSelect: () => navigator.clipboard?.writeText(dmsNo(doc.id)) },
                      ...(canDelete
                        ? [{ label: "Move to trash", onSelect: () => softDelete(doc.id), danger: true }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function FileBadge({ type, size = "md" }: { type: FileType; size?: "sm" | "md" }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-radius-sm border border-ink-200 bg-ink-0 font-mono text-ink-500 ${
        size === "md" ? "h-8 w-8 text-[9px]" : "h-6 w-6 text-[8px]"
      }`}
      aria-hidden
    >
      {fileTypeLabel(type)}
    </span>
  );
}
