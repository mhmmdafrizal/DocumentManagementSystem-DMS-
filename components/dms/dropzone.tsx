"use client";

import { useRef, useState } from "react";
import { Notice } from "@/components/ui/notice";

const ALLOWED = ["pdf", "docx", "xlsx", "png", "jpg", "txt", "md"];

export function DropZone({ onAccepted }: { onAccepted: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ext = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED.includes(ext(file.name))) {
      setError(`${file.name} (${ext(file.name)}) is not supported. Accepted: ${ALLOWED.join(", ")}.`);
      return;
    }
    setError(null);
    onAccepted(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-40 flex-col items-center justify-center gap-2 rounded-radius-xl border-2 border-dashed px-6 text-center transition-colors ${
          dragging
            ? "border-primary-500 bg-primary-50"
            : "border-ink-300 bg-ink-0 hover:border-primary-400 hover:bg-ink-25"
        }`}
      >
        <span className="flex size-10 items-center justify-center rounded-radius-full bg-ink-100 text-ink-500">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M10.75 4.25a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </span>
        <span className="text-sm font-medium text-ink-800">Drag a file here, or click to browse</span>
        <span className="text-xs text-ink-500">PDF, DOCX, XLSX, PNG, JPG, TXT, MD · up to 50 MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <Notice tone="error" role="alert" title="Unsupported file">
          {error}
        </Notice>
      )}
    </div>
  );
}