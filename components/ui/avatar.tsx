import type { Person } from "@/lib/mock";

const sizeMap = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

const hue = ["bg-primary-600", "bg-ink-700", "bg-danger-600", "bg-primary-400", "bg-ink-500"];

export function Avatar({
  person,
  size = "sm",
  online,
}: {
  person: Person;
  size?: keyof typeof sizeMap;
  online?: boolean;
}) {
  const idx = person.id.charCodeAt(1) % hue.length;
  return (
    <span className="relative inline-flex shrink-0" title={`${person.name} — ${person.role}`}>
      <span
        className={`inline-flex items-center justify-center rounded-radius-full font-mono font-semibold tracking-tight text-white ${sizeMap[size]} ${hue[idx]}`}
        aria-hidden
      >
        {person.initials}
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-radius-full bg-success-600 ring-2 ring-ink-0" aria-label="Online" />
      )}
    </span>
  );
}

export function AvatarStack({ people, max = 3 }: { people: Person[]; max?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex items-center -space-x-1.5">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size="sm" />
      ))}
      {rest > 0 && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-radius-full bg-ink-100 text-[10px] font-medium text-ink-600 ring-2 ring-ink-0" aria-hidden>
          +{rest}
        </span>
      )}
    </span>
  );
}