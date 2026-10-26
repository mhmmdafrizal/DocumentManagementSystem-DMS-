"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { people, timeAgo } from "@/lib/mock";
import { useLiveDocs } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { FileBadge } from "@/components/dms/doc-table";
import { VersionBadge } from "@/components/ui/chip";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function SearchPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <Suspense fallback={<div className="mt-4"><TableSkeleton /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const docs = useLiveDocs();

  const results = useMemo(() => {
    if (!q.trim()) return docs;
    const low = q.toLowerCase();
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(low) ||
        d.description.toLowerCase().includes(low) ||
        d.tags.some((t) => t.toLowerCase().includes(low)) ||
        d.category.toLowerCase().includes(low)
    );
  }, [q, docs]);

  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, tag, owner, date…"
          aria-label="Search documents"
          className="h-9 w-full max-w-md rounded-radius-md border border-ink-200 bg-ink-0 pl-3 pr-3 text-13 text-ink-800 placeholder:text-ink-400 focus:border-primary-500 focus:bg-ink-0 focus:outline-none"
          autoFocus
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-b border-ink-200 pb-1.5">
        <span className="micro-label">Register</span>
        <span className="drawing-no text-[11px] text-ink-400">
          {String(results.length).padStart(2, "0")} {results.length === 1 ? "sheet" : "sheets"}
        </span>
      </div>

      {results.length > 0 ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {results.map((doc) => {
            const owner = people.find((p) => p.id === doc.ownerId);
            return (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="group flex items-center gap-3 rounded-radius-sm border border-ink-200 bg-ink-0 px-3 py-2.5 shadow-sm transition-colors hover:bg-ink-25"
              >
                <FileBadge type={doc.fileType} size="sm" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-13 font-medium text-ink-800 group-hover:text-primary-700">{doc.title}</span>
                  <span className="block truncate text-xs text-ink-500">{owner?.name} · {doc.category}</span>
                </div>
                <span className="hidden flex-wrap gap-1 md:flex">
                  {doc.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-radius-md bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">{t}</span>
                  ))}
                </span>
                <VersionBadge no={doc.version} />
                <span className="hidden drawing-no text-[11px] text-ink-400 md:block">{timeAgo(doc.updatedAt)}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No documents match"
          body={`Nothing matched "${q}". Try a different title, tag, owner, or date range.`}
        />
      )}
    </>
  );
}