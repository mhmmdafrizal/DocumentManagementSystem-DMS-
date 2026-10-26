import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth";

// Next 16: middleware.ts is deprecated; this is proxy.ts. It defaults to the
// Node.js runtime, so the session cookie is validated against the DB for real,
// not just checked for presence.
//
// /api/* is excluded from the matcher and self-guards inside each handler
// (documented Next pattern — proxy alone is never the only check).

const PUBLIC = ["/", "/login", "/register", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? getSessionUser(token) : null;
  const isPublic = PUBLIC.includes(pathname);

  if (!isPublic && !user) {
    const next = encodeURIComponent(pathname);
    const login = new URL(request.nextUrl);
    login.pathname = "/login";
    login.search = next ? `?next=${next}` : "";
    return NextResponse.redirect(login);
  }

  if (isPublic && user && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};