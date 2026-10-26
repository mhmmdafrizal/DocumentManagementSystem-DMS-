import type { ReactNode } from "react";

/**
 * Revision triangle — the margin mark beside every revision.
 * The number sits inside the triangle, as on a controlled drawing.
 */
export function RevTriangle({ n, className }: { n: number; className?: string }) {
  const label = String(n);
  const twoDigit = label.length > 1;
  return (
    <svg viewBox="0 0 26 24" className={className} role="img" aria-label={`Revision ${n}`}>
      <path
        d="M13 2.5 L24.2 21.5 H1.8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x="13"
        y={twoDigit ? "18" : "18.4"}
        textAnchor="middle"
        fontSize={twoDigit ? "8" : "9.5"}
        fontWeight="600"
        fill="currentColor"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </text>
    </svg>
  );
}

function Cell({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="border-r border-b border-ink-200 px-3 py-1.5">
      <div className="micro-label">{label}</div>
      <div
        className={`truncate ${mono ? "drawing-no text-13" : "text-13"} ${
          accent ? "font-semibold text-revision" : "text-ink-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Title block — the sheet's identity. Every controlled document carries one,
 * anchored to the corner of the drawing.
 */
export function TitleBlock({
  docNo,
  title,
  revision,
  owner,
  date,
  status,
}: {
  docNo: string;
  title: string;
  revision: number;
  owner: string;
  date: string;
  status: string;
}) {
  return (
    <div className="grid grid-cols-2 border-t border-l border-ink-200 bg-ink-0 sm:grid-cols-4">
      <div className="col-span-2 flex flex-wrap items-baseline gap-x-3 border-r border-b border-ink-200 px-3 py-2 sm:col-span-4">
        <span className="micro-label">Title</span>
        <span className="min-w-0 flex-1 truncate text-13 font-semibold text-ink-900">{title}</span>
      </div>
      <Cell label="Drawing no." value={docNo} mono />
      <Cell label="Revision" value={`REV ${revision}`} mono accent />
      <Cell label="Owner" value={owner} />
      <Cell label="Date" value={date} mono />
      <Cell label="Scale" value="NTS" mono />
      <Cell label="Status" value={status} />
      <Cell label="Seats" value="1 of 1" mono />
      <Cell label="Class" value="Controlled" mono />
    </div>
  );
}
