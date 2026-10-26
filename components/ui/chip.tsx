import type { ReactNode } from "react";

type ChipVariant = "tag" | "version" | "status";

const tones: Record<ChipVariant, string> = {
  tag: "bg-ink-100 text-ink-600",
  version: "bg-primary-50 text-primary-700 font-mono font-semibold",
  status: "bg-success-50 text-success-600",
};

export function Chip({
  variant = "tag",
  onRemove,
  children,
}: {
  variant?: ChipVariant;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-radius-sm px-1.5 py-0.5 text-xs font-medium leading-4 ${tones[variant]}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-sm text-current opacity-70 hover:opacity-100"
          aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
        >
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
          </svg>
        </button>
      )}
    </span>
  );
}

/**
 * Revision stamp — the version number is product-critical information,
 * so it is stamped like a revision field, never hidden.
 */
export function VersionBadge({ no }: { no: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-radius-sm border border-primary-600/35 bg-primary-50 px-1.5 py-0.5 leading-4 text-primary-700">
      <span className="font-mono text-[9px] font-medium tracking-[0.14em] opacity-70">REV</span>
      <span className="tabular font-mono text-[11px] font-semibold">{String(no).padStart(2, "0")}</span>
    </span>
  );
}
