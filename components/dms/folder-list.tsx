import Link from "next/link";
import { Folder } from "@/lib/mock";

export function FolderList({ folders }: { folders: Folder[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {folders.map((f) => (
        <Link
          key={f.id}
          href={`/folders/${f.id}`}
          className="group relative flex items-center gap-3 overflow-hidden rounded-radius-sm border border-ink-200 bg-ink-0 px-4 py-3 shadow-sm transition-colors hover:bg-ink-25"
        >
          <span className="absolute inset-y-0 left-0 w-[3px] bg-ink-200 transition-colors group-hover:bg-primary-600" aria-hidden />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-radius-sm border border-ink-200 bg-ink-25 text-ink-500 transition-colors group-hover:border-primary-600/30 group-hover:text-primary-700">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M2 4a1 1 0 011-1h4.5a1 1 0 01.7.3L9.9 4.93a1 1 0 00.7.3h6a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-13 font-medium text-ink-800 group-hover:text-primary-700">{f.name}</span>
            <span className="micro-label block">Folder</span>
          </span>
        </Link>
      ))}
    </div>
  );
}