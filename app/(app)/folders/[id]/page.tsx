"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCan, useFolders, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { DocTable } from "@/components/dms/doc-table";
import { FolderList } from "@/components/dms/folder-list";
import { FolderGovernance } from "@/components/dms/folder-governance";

const uploadLink =
  "inline-flex h-6 items-center justify-center gap-1 whitespace-nowrap rounded-radius-md bg-primary-600 px-2 text-13 font-medium text-white shadow-sm transition-colors select-none hover:bg-primary-700 active:bg-primary-800";

export default function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const folders = useFolders();
  const s = useStore();
  const can = useCan(id);
  const folder = folders.find((f) => f.id === id);
  const children = folders.filter((f) => f.parentId === id);
  const docs = s.docs.filter((d) => d.folderId === id && !d.deletedAt);

  const crumbs: { label: string; href?: string }[] = [{ label: "Folders", href: "/folders" }];
  if (folder) {
    const ancestors: { label: string; href: string }[] = [];
    let cur = folder.parentId;
    while (cur) {
      const p = folders.find((f) => f.id === cur);
      if (p) {
        ancestors.unshift({ label: p.name, href: `/folders/${p.id}` });
        cur = p.parentId;
      } else break;
    }
    ancestors.forEach((a) => crumbs.push(a));
    crumbs.push({ label: folder.name });
  } else {
    crumbs.push({ label: "Folder not found" });
  }

  if (!folder) {
    return (
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Folders", href: "/folders" }, { label: "Not found" }]} />
        <EmptyState title="Folder not found" body="This folder may have been deleted or moved." action={<Link href="/folders" className={uploadLink}>Go to Folders</Link>} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Breadcrumbs items={crumbs} />
        {can("upload") && (
          <Link href="/upload" className={uploadLink}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path d="M10.75 4.25a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
            Upload here
          </Link>
        )}
      </div>

      <FolderGovernance folderId={id} />

      {children.length > 0 && (
        <section className="mb-4">
          <FolderList folders={children} />
        </section>
      )}

      {docs.length > 0 ? (
        <div className="rounded-radius-lg border border-ink-200 bg-ink-0 shadow-sm"><DocTable docs={docs} /></div>
      ) : (
        <EmptyState
          title="No documents here"
          body="Upload the first document to this folder to begin building your single source of truth."
          action={<Link href="/upload" className={uploadLink}>Upload document</Link>}
        />
      )}
    </div>
  );
}
