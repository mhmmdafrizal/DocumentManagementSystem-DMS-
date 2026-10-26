import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid-paper flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="ticks sheet relative w-full max-w-sm px-8 py-10 text-center">
        <p className="micro-label">Sheet not found</p>
        <p className="drawing-no mt-3 text-5xl font-semibold text-ink-300">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink-900">Not in the register</h1>
        <p className="mt-2 text-sm text-ink-500">
          This sheet doesn’t exist or you don’t have permission to view it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-8 items-center gap-2 rounded-radius-sm bg-primary-600 px-4 text-13 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
