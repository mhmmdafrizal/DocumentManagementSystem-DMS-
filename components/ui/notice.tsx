import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, { bar: string; text: string; icon: ReactNode }> = {
  info: { bar: "bg-primary-500", text: "text-ink-700", icon: <InfoIcon /> },
  success: { bar: "bg-success-600", text: "text-ink-700", icon: <CheckIcon /> },
  warning: { bar: "bg-warning-600", text: "text-ink-700", icon: <WarnIcon /> },
  error: { bar: "bg-danger-600", text: "text-ink-700", icon: <ErrorIcon /> },
};

export function Notice({
  tone = "info",
  title,
  children,
  role = "status",
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  role?: "status" | "alert";
}) {
  const t = tones[tone];
  return (
    <div
      role={role === "alert" ? "alert" : undefined}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={`flex items-start gap-2.5 rounded-radius-lg border border-ink-200 bg-ink-0 px-3 py-2.5 shadow-sm ${t.text}`}
    >
      <span className="relative mt-0.5 h-6 w-6 shrink-0">
        <span className={`absolute inset-y-0 left-0 w-[3px] ${t.bar}`} />
        <span className="absolute inset-0 flex items-center justify-center pl-1 text-ink-400">
          {t.icon}
        </span>
      </span>
      <div className="min-w-0 text-sm">
        {title && <p className="font-medium text-ink-800">{title}</p>}
        {children && <div className="text-ink-600">{children}</div>}
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9a1 1 0 10-2 0v4a1 1 0 102 0V9zm-1-3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}