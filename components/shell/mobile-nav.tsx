"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink-900/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal={open}
        aria-label="Navigation"
        className={`absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>
    </div>
  );
}