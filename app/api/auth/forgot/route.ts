import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email } = body as { email?: string };
  if (typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  // Same shape whether or not the account exists — no account enumeration.
  return NextResponse.json(createResetToken(email));
}