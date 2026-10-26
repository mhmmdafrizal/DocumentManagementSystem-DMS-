"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not create the account.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not create the account.");
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
            <h1 className="text-xl font-semibold text-ink-900">Create your account</h1>
            <p className="mt-1 text-sm text-ink-500">Join the workspace to start working with documents.</p>
          </div>

          <Field label="Full name" htmlFor="name">
            <Input
              id="name"
              autoComplete="name"
              placeholder="Maria Okafor"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
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
          <Field label="Password" htmlFor="password" hint="At least 8 characters.">
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
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-700 hover:underline">
            Sign in
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