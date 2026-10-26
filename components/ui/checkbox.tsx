export function Checkbox({
  indeterminate,
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean; label?: string }) {
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        aria-label={label}
        ref={(el) => {
          if (el) el.indeterminate = !!indeterminate;
        }}
        className="peer size-4 appearance-none rounded-radius-sm border border-ink-300 bg-ink-0 text-ink-800 transition-colors checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500"
        {...rest}
      />
      {indeterminate ? (
        <svg className="pointer-events-none absolute inset-0 size-4 text-primary-600" viewBox="0 0 16 16" aria-hidden>
          <rect x="3" y="7" width="10" height="2" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg className="pointer-events-none absolute inset-0 hidden size-4 text-white peer-checked:block" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}