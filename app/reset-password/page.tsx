"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";

// Two modes on one public route: /reset-password (request a link) and
// /reset-password?token=... (set a new password). useSearchParams and the
// forms live below the Suspense boundary as required by Next 16.

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [email, setEmail] = useState("");
  const [sentLink, setSentLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("Could not request a reset link.");
        setLoading(false);
        return;
      }
      const body = await res.json();
      // ponytail: dev-only delivery — endpoint inlines the link when not production
      setSentLink(body.devResetUrl ?? null);
      setSent(true);
      setLoading(false);
    } catch {
      setError("Could not request a reset link.");
      setLoading(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not reset the password.");
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Could not reset the password.");
      setLoading(false);
    }
  };

  return (
    <div className="grid-paper flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-radius-sm bg-primary-600 text-white">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 4 L20 19 H4 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-ink-900">Relay</span>
          <span className="micro-label leading-3">Document control</span>
        </span>
      </div>

      <div className="ticks relative w-full max-w-sm rounded-radius-sm border border-ink-200 bg-ink-0 p-6 shadow-xl">
        {done ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold text-ink-900">Password updated</h1>
            <p className="text-sm text-ink-600">
              Your password was changed and all active sessions were signed out. Sign in with the new password.
            </p>
            <Link href="/login">
              <Button className="w-full">Sign in</Button>
            </Link>
          </div>
        ) : token ? (
          <form onSubmit={reset} className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold text-ink-900">Set a new password</h1>
              <p className="mt-1 text-sm text-ink-500">Choose a password at least 8 characters long.</p>
            </div>
            <Field label="New password" htmlFor="password" hint="At least 8 characters.">
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirm">
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-revision">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading}>
              Reset password
            </Button>
          </form>
        ) : (
          <form onSubmit={requestLink} className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold text-ink-900">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-500">
                Enter your work email and we&apos;ll send you a reset link.
              </p>
            </div>
            <Field label="Work email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="maria@acme.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {sentLink && (
              <div className="rounded-radius-sm border border-primary-200 bg-primary-50 p-3 text-sm text-ink-700">
                <p className="font-medium">This is a demo — click the link to continue:</p>
                <Link href={sentLink} className="mt-1 block break-all font-mono text-xs text-primary-700 underline">
                  {sentLink}
                </Link>
              </div>
            )}
            {!sentLink && error && (
              <p role="alert" className="text-sm text-revision">
                {error}
              </p>
            )}
            {!sentLink && !error && sent && (
              <p className="rounded-radius-sm border border-ink-200 bg-ink-50 p-3 text-sm text-ink-600">
                If an account exists for that email, a reset link is on its way.
              </p>
            )}
            <Button type="submit" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-ink-600">
          <Link href="/login" className="font-medium text-primary-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <p className="mt-6 text-xs text-ink-400">
        <Link href="/" className="hover:underline">
          <span className="sr-only">Back to</span>Home
        </Link>
      </p>
    </div>
  );
}