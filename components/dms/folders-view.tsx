"use client";

import { useState } from "react";
import { addFolder, useCan, useFolders, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { DocTable } from "@/components/dms/doc-table";
import { FolderList } from "@/components/dms/folder-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function FoldersView() {
  const folders = useFolders();
  const s = useStore();
  const can = useCan();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function add() {
    if (!name.trim()) return;
    addFolder(name);
    setName("");
    setAdding(false);
  }

  function cancel() {
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Breadcrumbs items={[{ label: "All folders" }]} />
        {can("create") && (
          <Button variant="primary" size="sm" icon={<PlusIcon />} onClick={() => setAdding(true)}>
            New folder
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-radius-sm border border-ink-200 bg-ink-50 p-2.5">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") cancel();
            }}
            placeholder="Folder name"
            aria-label="Folder name"
            className="max-w-xs"
          />
          <Button size="sm" variant="primary" onClick={add} disabled={!name.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
        </div>
      )}

      {folders.length ? (
        <div className="space-y-4">
          <FolderList folders={folders} />
          {folders.map((f) => {
            const docs = s.docs.filter((d) => d.folderId === f.id && !d.deletedAt);
            return docs.length > 0 ? (
              <section key={f.id} className="mt-4">
                <h2 className="micro-label mb-2">{f.name}</h2>
                <div className="rounded-radius-lg border border-ink-200 bg-ink-0 shadow-sm"><DocTable docs={docs} /></div>
              </section>
            ) : null;
          })}
        </div>
      ) : (
        <EmptyState
          title="No folders yet"
          body="Create your first folder to organise governed documents."
          action={<Button size="sm" onClick={() => setAdding(true)}>Create folder</Button>}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10.75 4.25a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}
