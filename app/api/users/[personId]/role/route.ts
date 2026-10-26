import { NextResponse, type NextRequest } from "next/server";
import { Role } from "@/lib/mock";
import { SESSION_COOKIE, changeUserRole, getSessionUser } from "@/lib/auth";

const ROLES: Role[] = ["owner", "editor", "viewer"];

// Segment is the member's stable personId (what the client store uses), NOT
// the users table's internal id column.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ personId: string }> }) {
  const { personId } = await ctx.params;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const actor = token ? getSessionUser(token) : null;
  if (!actor) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { role } = body as { role?: string };
  if (typeof role !== "string" || !(ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: "Role must be owner, editor or viewer." }, { status: 400 });
  }

  try {
    const user = changeUserRole(actor, personId, role as Role);
    return NextResponse.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not change the role.";
    const status = message === "Only owners can change roles." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}