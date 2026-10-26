import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSession, createUser } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body as { name?: string; email?: string; password?: string };
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  let user;
  try {
    user = createUser({ name, email, password });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create the account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, createSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}