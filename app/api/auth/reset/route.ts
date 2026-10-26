import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { token, password } = body as { token?: string; password?: string };
  if (typeof token !== "string" || token.length < 20) {
    return NextResponse.json({ error: "This reset link has expired or already been used." }, { status: 400 });
  }
  if (typeof password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }
  try {
    await resetPassword(token, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reset the password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}