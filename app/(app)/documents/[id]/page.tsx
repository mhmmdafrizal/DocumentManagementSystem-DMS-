"use client";

import { useParams, useRouter } from "next/navigation";
import { peopleById } from "@/lib/mock";
import { roleOf, softDelete, useCan, useDoc, useStore, useVersions } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VersionBadge } from "@/components/ui/chip";
import { Chip } from "@/components/ui/chip";
import { FilePreview } from "@/components/dms/file-preview";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Button } from "@/components/ui/button";
import { TitleBlock } from "@/components/ui/rev";
import { downloadDoc } from "@/components/dms/doc-table";
import { VersionListWrapper } from "./version-tab";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const doc = useDoc(id);
  const versions = useVersions(id);
  const can = useCan(doc?.folderId);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState title="Document not found" body="This document may have been deleted or you lack permission." />
      </div>
    );
  }

  const currentVersion = versions[0];
  const owner = peopleById()[doc.ownerId];
  const folder = s.folders.find((f) => f.id === doc.folderId);
  const docNo = `DMS-${doc.id.replace(/^d-/, "").toUpperCase()}`;
  const drawnDate = new Date(doc.updatedAt).toISOString().slice(0, 10);
  const myRole = roleOf(s, s.actingUserId, doc.folderId);

  const crumbs = [
    { label: "Folders", href: "/folders" },
    ...(folder ? [{ label: folder.name, href: `/folders/${folder.id}` }] : []),
    { label: doc.title },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 px-6 py-4">
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={crumbs} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-ink-900">{doc.title}</h1>
            <VersionBadge no={doc.version} />
            {doc.deletedAt && (
              <span className="rounded-radius-sm border border-revision/40 bg-danger-50 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-revision">
                IN TRASH
              </span>
            )}
          </div>
          <p className="mt-1 max-w-xl truncate text-sm text-ink-500">{doc.description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" onClick={() => downloadDoc(doc)}>
            Download
          </Button>
          {doc.deletedAt ? (
            can("restore") && (
              <Button size="sm" variant="primary" onClick={() => router.push("/trash")}>
                In Trash
              </Button>
            )
          ) : (
            can("delete") && (
              <Button
                size="sm"
                variant="danger-quiet"
                onClick={() => {
                  if (!confirm(`Move "${doc.title}" to trash?`)) return;
                  softDelete(doc.id);
                  router.push(folder ? `/folders/${folder.id}` : "/folders");
                }}
              >
                Move to trash
              </Button>
            )
          )}
        </div>
      </div>

      {doc.deletedAt && (
        <div className="px-6 pt-4">
          <Notice tone="warning" title="This document is in the trash">
            Restore it from the Trash page before making changes. Pages like this stay readable for audit.
          </Notice>
        </div>
      )}

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Preview (left 80%) */}
        <FilePreview type={doc.fileType} title={doc.title} version={currentVersion} />

        {/* Metadata panel (right 20%) */}
        <aside className="w-full shrink-0 border-t border-ink-200 bg-ink-0 p-5 shadow-inner lg:w-72 lg:border-t-0 lg:border-l">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="micro-label">Owner</dt>
              <dd className="mt-1 flex items-center gap-2">
                {owner && <Avatar person={owner} size="xs" />}
                <span className="text-ink-800">{owner?.name}</span>
              </dd>
            </div>
            <div>
              <dt className="micro-label">Folder</dt>
              <dd className="mt-1 text-ink-800">{folder?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="micro-label">Your access</dt>
              <dd className="mt-1 capitalize text-ink-800">{myRole}</dd>
            </div>
            <div>
              <dt className="micro-label">Category</dt>
              <dd className="mt-1 text-ink-800">{doc.category}</dd>
            </div>
            <div>
              <dt className="micro-label">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {doc.tags.map((t) => <Chip key={t}>{t}</Chip>)}
                {!doc.tags.length && <span className="text-ink-400">—</span>}
              </dd>
            </div>
            <div>
              <dt className="micro-label">Last updated</dt>
              <dd className="mt-1 text-xs tabular text-ink-600">{new Date(doc.updatedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="micro-label">File type</dt>
              <dd className="mt-1 uppercase text-ink-800">{doc.fileType}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-ink-200 pt-4">
            <h2 className="micro-label">Version history</h2>
            <div className="mt-2">
              <VersionListWrapper docId={doc.id} versions={versions} current={doc.version} />
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-ink-200 bg-ink-100/60 px-6 py-3">
        <div className="ml-auto max-w-3xl">
          <TitleBlock
            docNo={docNo}
            title={doc.title}
            revision={doc.version}
            owner={owner?.name ?? "—"}
            date={drawnDate}
            status={doc.category}
          />
        </div>
      </div>
    </div>
  );
}
