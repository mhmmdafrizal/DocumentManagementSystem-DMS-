import Link from "next/link";
import { Fragment } from "react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-ink-500">
      <ol className="flex min-w-0 items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={c.label}>
              {i > 0 && (
                <svg className="h-3.5 w-3.5 shrink-0 text-ink-300" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M6 3.5l4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <li className="min-w-0">
                {last || !c.href ? (
                  <span aria-current={last ? "page" : undefined} className={`truncate ${last ? "font-medium text-ink-800" : ""}`}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="truncate hover:text-ink-800 hover:underline">
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}