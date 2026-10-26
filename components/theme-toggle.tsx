"use client";

import { useSyncExternalStore } from "react";

function getDark() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function subscribeDark(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeDark, getDark, () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try { sessionStorage.setItem("dms-theme", next ? "dark" : "light"); } catch {}
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex size-7 items-center justify-center rounded-radius-md text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5A6.502 6.502 0 0110 3.5a6.5 6.5 0 000 13z"/></svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
      )}
    </button>
  );
}