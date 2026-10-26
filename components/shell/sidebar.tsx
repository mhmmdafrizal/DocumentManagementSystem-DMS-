"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { workspaces, Folder } from "@/lib/mock";
import { roleOf, useActingUser, useCan, useFolders, useStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const acting = useActingUser();
  const s = useStore();
  const can = useCan();
  const role = roleOf(s, s.actingUserId);

  const navLink = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-2.5 rounded-radius-sm px-2 py-1.5 text-13 transition-colors ${
          active
            ? "bg-primary-50 font-medium text-primary-700 dark:bg-primary-100/20 dark:text-primary-400"
            : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
        }`}
        title={collapsed ? label : undefined}
      >
        {active && <span className="absolute inset-y-1 left-0 w-[3px] bg-primary-600" aria-hidden />}
        {icon}
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      aria-label="Primary"
      className={`flex h-full shrink-0 flex-col border-r border-ink-200 bg-ink-0 transition-[width] ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-ink-200 px-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-radius-sm bg-primary-600 text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 4 L20 19 H4 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold tracking-tight text-ink-900">
              {workspaces[0].name}
            </span>
            <span className="micro-label block leading-3">Register</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto hidden size-7 items-center justify-center rounded-radius-sm text-ink-500 hover:bg-ink-100 sm:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M8 5l-3 5 3 5M13 5l-3 5 3 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-3">
        <nav className="space-y-0.5" aria-label="Sections">
          {navLink("/dashboard", "Home", <HomeIcon />)}
          {navLink("/folders", "Folders", <FolderIcon />)}
          {navLink("/trash", "Trash", <TrashIcon />)}
          {can("manage") && navLink("/settings/members", "Members", <MembersIcon />)}
          {can("manage") && navLink("/audit", "Audit log", <AuditIcon />)}
        </nav>

        <div>
          <p className={`micro-label px-2 pb-1.5 ${collapsed ? "text-center" : ""}`}>
            {collapsed ? "·" : "Folder index"}
          </p>
          <FolderTree collapsed={collapsed} />
        </div>
      </div>

      <div className="border-t border-ink-200 p-2">
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-1"}`}>
          {!collapsed && (
            <span className="flex size-7 items-center justify-center rounded-radius-full bg-ink-600 text-[10px] font-semibold text-white">
              {acting.initials}
            </span>
          )}
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-13 font-medium text-ink-800">{acting.name}</span>
              <span className="block text-[11px] capitalize text-ink-500">{role}</span>
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function FolderTree({ collapsed }: { collapsed: boolean }) {
  const folders = useFolders();
  return (
    <ul className="space-y-0.5" role="tree" aria-label="Folder tree">
      {folders.filter((f) => f.parentId === null).map((f) => (
        <TreeFolder key={f.id} folder={f} all={folders} depth={0} collapsed={collapsed} />
      ))}
    </ul>
  );
}

function TreeFolder({ folder, all, depth, collapsed }: { folder: Folder; all: Folder[]; depth: number; collapsed: boolean }) {
  const children = all.filter((f) => f.parentId === folder.id);
  const [open, setOpen] = useState(depth === 0 && folder.id === "f-contracts");
  const pathname = usePathname();
  const active = pathname === `/folders/${folder.id}`;

  return (
    <li role="treeitem" aria-expanded={children.length > 0 ? open : undefined} aria-selected={active} aria-level={depth + 1}>
      <div
        className={`group flex items-center gap-1.5 rounded-radius-md py-1 pr-1 transition-colors ${
          active ? "bg-primary-50" : "hover:bg-ink-100"
        }`}
        style={{ paddingLeft: collapsed ? 14 : 6 + depth * 14 }}
      >
        {children.length > 0 && !collapsed ? (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
            className="flex size-4 shrink-0 items-center justify-center" 
          >
            <svg
              className={`h-3 w-3 text-ink-400 transition-transform ${open ? "rotate-90" : ""}`}
              viewBox="0 0 16 16" fill="currentColor" aria-hidden
            >
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
        <Link
          href={`/folders/${folder.id}`}
          className={`flex min-w-0 items-center gap-1.5 truncate text-13 ${active ? "font-medium text-primary-700" : "text-ink-600 hover:text-ink-900"}`}
          title={folder.name}
        >
          <svg className="size-4 shrink-0 text-ink-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M2 4a1 1 0 011-1h4.5a1 1 0 01.7.3L9.9 4.93a1 1 0 00.7.3h6a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" fillRule="evenodd" clipRule="evenodd" />
          </svg>
          {!collapsed && <span className="truncate">{folder.name}</span>}
        </Link>
      </div>
      {children.length > 0 && open && !collapsed && (
        <ul className="space-y-0.5" role="group">
          {children.map((c) => (
            <TreeFolder key={c.id} folder={c} all={all} depth={depth + 1} collapsed={collapsed} />
          ))}
        </ul>
      )}
    </li>
  );
}

function HomeIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10.7 2.24a1 1 0 00-1.4 0l-7 6.42A1 1 0 003 10h1v7a1 1 0 001 1h3a1 1 0 001-1v-4h2v4a1 1 0 001 1h3a1 1 0 001-1v-7h1a1 1 0 00.7-1.66l-7-6.42z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2 4a1 1 0 011-1h4.5a1 1 0 01.7.3L9.9 4.93a1 1 0 00.7.3h6a1 1 0 011 1v7.62A2 2 0 0116.5 15H3.5a2 2 0 01-2-2V4z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function MembersIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7 9a3 3 0 100-6 3 3 0 000 6zm6.5 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 16a5.5 5.5 0 0111 0 .5.5 0 01-.5.5H2a.5.5 0 01-.5-.5zM14 11.5c2.5 0 4.5 1.79 4.5 4v.5a.5.5 0 01-.5.5h-4.06A6.98 6.98 0 0014 16a6.98 6.98 0 00-1.53-4.4c.47-.07.98-.1 1.53-.1z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function AuditIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M5 2a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V6.5L12.5 2H5zm7 1.5L14.5 6H12V3.5zM6.5 9.25a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7zm0 3a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2.5 5.5a1 1 0 011-1h2.586L7.2 3.1A1 1 0 017.9 2.8h4.2a1 1 0 01.7.29L14.914 4.5h2.586a1 1 0 110 2h-15a1 1 0 01-1-1zm1 2h13l-.79 9.03A2 2 0 0113.72 18.5H6.28a2 2 0 01-1.99-1.97L3.5 7.5zm4.5 2a.5.5 0 00-.5.5v5a.5.5 0 001 0v-5a.5.5 0 00-.5-.5zm4 0a.5.5 0 00-.5.5v5a.5.5 0 001 0v-5a.5.5 0 00-.5-.5z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}