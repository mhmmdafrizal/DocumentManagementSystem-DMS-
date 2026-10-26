"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthUserLite, Person, peopleById } from "@/lib/mock";
import { roleOf, setActingUser, useActingUser, useStore } from "@/lib/store";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Menu } from "@/components/ui/menu";

export function Topbar({
  onToggleMobile,
  collaborators,
  users,
  sessionPersonId,
}: {
  onToggleMobile: () => void;
  collaborators: Person[];
  users: AuthUserLite[];
  sessionPersonId: string | null;
}) {
  const router = useRouter();
  const s = useStore();
  const acting = useActingUser();
  const [q, setQ] = useState("");
  const peopleMap = peopleById();

  const impersonating = !!sessionPersonId && acting.id !== sessionPersonId;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const trashCount = s.docs.filter((d) => d.deletedAt).length;
  const notifItems = [
    {
      label: `${trashCount} item${trashCount === 1 ? "" : "s"} in Trash`,
      onSelect: () => router.push("/trash"),
    },
    ...s.audit
      .slice(-4)
      .reverse()
      .map((a) => {
        const who = peopleMap[a.actorId];
        const doc = a.entityType === "document" ? s.docs.find((d) => d.id === a.entityId) : undefined;
        const after = a.after as { title?: string; name?: string; detail?: string } | undefined;
        const subject = doc?.title ?? after?.title ?? after?.name ?? after?.detail ?? "";
        return {
          label: `${who?.name.split(" ")[0] ?? "System"} — ${a.action}${subject ? ` ${subject}` : ""}`,
          onSelect: () =>
            router.push(doc ? `/documents/${doc.id}` : a.entityType === "folder" ? `/folders/${a.entityId}` : "/audit"),
        };
      }),
    { label: "Open audit log", onSelect: () => router.push("/audit") },
  ];

  const roleItems = [
    ...(impersonating
      ? [{ label: "Return to my account", onSelect: () => sessionPersonId && setActingUser(sessionPersonId) }]
      : []),
    ...users.map((u) => ({
      label: `${u.name} · ${roleOf(s, u.personId)}${u.personId === acting.id ? "  ✓" : ""}`,
      onSelect: () => setActingUser(u.personId),
    })),
    { label: "Log out", danger: true, onSelect: handleLogout },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-ink-0 px-4">
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-radius-md text-ink-500 hover:bg-ink-100 lg:hidden"
        onClick={onToggleMobile}
        aria-label="Open navigation"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" />
        </svg>
      </button>

      <form
        role="search"
        className="relative max-w-md flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-ink-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a document, tag, or owner…"
          aria-label="Search documents"
          className="h-8 w-full rounded-radius-sm border border-ink-200 bg-ink-0 pl-8 pr-12 text-13 text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-primary-600"
        />
        <kbd className="pointer-events-none absolute inset-y-0 right-2.5 hidden items-center font-mono text-[11px] text-ink-400 sm:flex" aria-hidden>
          /
        </kbd>
      </form>

      <div className="ml-auto flex items-center gap-2.5">
        <AvatarStack people={collaborators} max={4} />
        <Link
          href="/upload"
          className="inline-flex h-8 items-center gap-1.5 rounded-radius-md bg-primary-600 px-3 text-13 font-medium text-white transition-colors hover:bg-primary-700"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10.75 4.25a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span className="hidden sm:inline">Upload</span>
        </Link>
        <Menu
          label="Notifications"
          triggerClassName="relative inline-flex h-7 w-7 items-center justify-center rounded-radius-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          trigger={
            <>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M10 2a6 6 0 00-6 6v3.586l-1.293 1.293A1 1 0 003 14h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6M7.5 15a2.5 2.5 0 005 0h-5z" />
              </svg>
              {trashCount > 0 && (
                <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-revision" aria-hidden />
              )}
            </>
          }
          items={notifItems}
        />
        <Menu
          label={`${impersonating ? "Viewing as" : "Signed in as"} ${acting.name}`}
          align="right"
          triggerClassName="inline-flex h-8 items-center gap-1.5 rounded-radius-md px-1.5 text-ink-700 transition-colors hover:bg-ink-100"
          trigger={
            <>
              <Avatar person={acting} size="xs" />
              <span className="hidden text-13 font-medium sm:inline">{acting.name.split(" ")[0]}</span>
            </>
          }
          items={roleItems}
        />
      </div>
    </header>
  );
}
