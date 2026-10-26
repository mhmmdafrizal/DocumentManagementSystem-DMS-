"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { safeNext } from "@/lib/redirect";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Sign in failed. Try again.");
        setLoading(false);
        return;
      }
      // ponytail: read the redirect target directly instead of a Suspense-wrapped useSearchParams
      const target = safeNext(new URLSearchParams(window.location.search).get("next"), window.location.origin);
      router.push(target);
      router.refresh();
    } catch {
      setError("Sign in failed. Try again.");
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
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-900">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to the single source of truth.</p>
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
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-revision">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-3 text-center text-sm">
          <Link href="/reset-password" className="text-ink-500 hover:underline">
            Forgot password?
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-ink-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary-700 hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-4 border-t border-ink-100 pt-4 text-center text-xs text-ink-500">
          Demo: <span className="font-mono">maria.okafor@acme.com</span> · <span className="font-mono">relay-demo-1</span>
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