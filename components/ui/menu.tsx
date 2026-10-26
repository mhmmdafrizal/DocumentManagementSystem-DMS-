"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";

export function Menu({
  label,
  items,
  align = "right",
  trigger,
  triggerClassName,
  menuClassName,
}: {
  label: string;
  items: { label: string; onSelect: () => void; danger?: boolean }[];
  align?: "left" | "right";
  trigger?: ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstItemRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) firstItemRef.current?.focus();
  }, [open]);

  const itemKeys = items.map((i, idx) => ({ ...i, idx }));
  const onItemKey = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        (rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-menu-item]")[next])?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        (rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-menu-item]")[prev])?.focus();
      }
    },
    [items.length]
  );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName ?? "inline-flex size-7 items-center justify-center rounded-radius-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"}
      >
        {trigger ?? (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M6 10a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0zm5.75 0a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0zm5.75 0a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0z" />
          </svg>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute z-40 mt-1 w-56 overflow-hidden rounded-radius-lg border border-ink-200 bg-ink-0 py-1 shadow-lg ${align === "right" ? "right-0" : "left-0"} ${menuClassName ?? ""}`}
        >
          {itemKeys.map(({ label: itemLabel, onSelect, danger, idx }) => (
            <button
              key={itemLabel}
              ref={idx === 0 ? firstItemRef : undefined}
              data-menu-item
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect();
              }}
              onKeyDown={(e) => onItemKey(e, idx)}
              className={`block w-full truncate px-3 py-1.5 text-left text-13 hover:bg-ink-100 ${danger ? "text-danger-600" : "text-ink-800"}`}
            >
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}