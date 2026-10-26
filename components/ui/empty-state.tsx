import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="ticks grid-paper relative flex flex-col items-center justify-center gap-2 rounded-radius-lg border border-ink-200 px-6 py-16 text-center">
      {icon && (
        <div className="mb-1 flex size-10 items-center justify-center rounded-radius-sm border border-ink-200 bg-ink-0 text-ink-500">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold tracking-tight text-ink-900">{title}</h3>
      {body && <p className="max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
