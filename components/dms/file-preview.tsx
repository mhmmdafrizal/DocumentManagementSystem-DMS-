import { DocVersion, FileType } from "@/lib/mock";
import { Chip, VersionBadge } from "@/components/ui/chip";

export function FilePreview({ type, title, version }: { type: FileType; title: string; version: DocVersion | undefined }) {
  switch (type) {
    case "md":
    case "txt":
      return (
        <div className="grid-paper flex-1 overflow-y-auto p-6">
          <article className="ticks relative mx-auto max-w-2xl rounded-radius-sm border border-ink-200 bg-ink-0 p-8 shadow-md">
            <FileTitle title={title} version={version} />
            <div className="mt-4 space-y-3 text-sm leading-6 text-ink-700">
              <p className="drawing-no text-xs text-ink-500"># {title}</p>
              <p>
                This is a preview of the document body for <span className="font-medium text-ink-900">{title}</span>.
                Metadata, tags, and the full version history are available in the panel to the right.
              </p>
              <p>
                For governed documents the body is rendered from the current immutable version. Selecting an older
                version in History never mutates this record — restore creates a new version.
              </p>
            </div>
          </article>
        </div>
      );
    case "pdf":
      return (
        <div className="grid-paper flex flex-1 items-center justify-center p-6">
          <div className="ticks relative flex aspect-[3/4] w-full max-w-sm flex-col gap-3 rounded-radius-sm border border-ink-200 bg-ink-0 p-4 shadow-md">
            <FileTitle title={title} version={version} />
            <div className="flex flex-1 flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-2 rounded-[1px] bg-ink-100 ${i === 2 ? "w-4/5" : i === 4 ? "w-3/4" : "w-full"}`} aria-hidden />
              ))}
            </div>
          </div>
        </div>
      );
    case "png":
    case "jpg":
      return (
        <div className="grid-paper flex flex-1 items-center justify-center p-6">
          <div className="ticks relative flex h-full max-h-full w-full max-w-sm flex-col gap-3 rounded-radius-sm border border-ink-200 bg-ink-0 p-4 shadow-md">
            <FileTitle title={title} version={version} />
            <div className="flex flex-1 items-center justify-center rounded-radius-sm border border-ink-100 bg-ink-50 text-ink-300">
              <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <circle cx="8.5" cy="10" r="1.5" />
                <path d="M5 17l5-5 3 3 3-3 3 3" />
              </svg>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="grid-paper flex flex-1 items-center justify-center p-6">
          <div className="ticks relative flex max-w-sm flex-col items-center gap-3 rounded-radius-sm border border-ink-200 bg-ink-0 px-8 py-10 text-center shadow-md">
            <FileBadgeStatic type={type} />
            <p className="text-sm font-medium text-ink-800">{title}</p>
            <p className="text-xs text-ink-500">This format opens in its native application.</p>
          </div>
        </div>
      );
  }
}

function FileTitle({ title, version }: { title: string; version: DocVersion | undefined }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ink-200 pb-2">
      <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
      <div className="flex items-center gap-1.5">
        {version && (
          <Chip variant="status">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M12.2 3.3a.75.75 0 010 1.06L7.06 9.5a.75.75 0 01-1.06 0L3.8 7.3a.75.75 0 111.06-1.06l1.85 1.85 4.43-4.44a.75.75 0 011.06 0z" />
            </svg>
            Current
          </Chip>
        )}
        {version && <VersionBadge no={version.no} />}
      </div>
    </div>
  );
}

function FileBadgeStatic({ type }: { type: FileType }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-radius-sm border border-ink-200 bg-ink-0 font-mono text-xs text-ink-500" aria-hidden>
      {type === "docx" ? "DOCX" : type.toUpperCase()}
    </span>
  );
}
