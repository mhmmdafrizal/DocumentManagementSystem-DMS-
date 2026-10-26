import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, getSessionUser, listUsers } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? getSessionUser(token) : null;
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ users: listUsers() });
}