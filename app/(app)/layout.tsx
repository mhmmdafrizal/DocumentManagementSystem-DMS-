"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { AuthUserLite, people } from "@/lib/mock";
import { setActingUser, syncAuthUsers } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState<AuthUserLite[]>([]);
  const [sessionPersonId, setSessionPersonId] = useState<string | null>(null);

  // Hydrate backend accounts into the local store once, on mount. The session
  // cookie is httpOnly, so the client always learns "who am I" from /me.
  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await fetch("/api/auth/me");
      if (!me.ok) {
        router.replace("/login");
        return;
      }
      const { user } = await me.json();
      setSessionPersonId(user.personId);
      setActingUser(user.personId);
      // Session valid but the user list failed (e.g. transient 500): render with
      // an empty switcher rather than crash the whole app on `users.map`.
      const listRes = await fetch("/api/users");
      if (!alive || !listRes.ok) return;
      const list = await listRes.json();
      if (!alive || !Array.isArray(list.users)) return;
      syncAuthUsers(list.users as AuthUserLite[]);
      setUsers(list.users as AuthUserLite[]);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        onToggleMobile={() => setMobileOpen(true)}
        collaborators={people.slice(0, 3)}
        users={users}
        sessionPersonId={sessionPersonId}
      />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="grid-paper min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}