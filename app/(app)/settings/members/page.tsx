"use client";

import { useState } from "react";
import { Role } from "@/lib/mock";
import { setMemberRole, useCan, useMembers, useMembersById, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Notice } from "@/components/ui/notice";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/field";

export default function MembersPage() {
  const members = useMembers();
  const people = useMembersById();
  const s = useStore();
  const can = useCan();
  const [roleError, setRoleError] = useState<string | null>(null);

  const overrideCount = (personId: string) =>
    Object.values(s.folderRoles).filter((byPersonId) => byPersonId[personId]).length;

  // Optimistic local update + audit, then persist to the DB. Revert on failure.
  const changeRole = async (personId: string, role: Role) => {
    const current = members.find((m) => m.personId === personId)?.role;
    setRoleError(null);
    setMemberRole(personId, role);
    try {
      const res = await fetch(`/api/users/${personId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setRoleError(body.error ?? "Could not save the role.");
        if (current) setMemberRole(personId, current);
      }
    } catch {
      setRoleError("Could not save the role.");
      if (current) setMemberRole(personId, current);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Breadcrumbs items={[{ label: "Members" }]} />
      <h1 className="mt-3 text-xl font-semibold text-ink-900">Members &amp; roles</h1>
      <p className="mt-1 text-sm text-ink-500">
        Workspace roles apply everywhere. Per-folder overrides are set on each folder page.
      </p>

      {!can("manage") && (
        <div className="mt-4">
          <Notice tone="warning" title="Read-only access">
            Only owners can change roles.
          </Notice>
        </div>
      )}

      {roleError && (
        <div className="mt-4">
          <Notice tone="error" title="Could not save">
            {roleError}
          </Notice>
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-radius-lg border border-ink-200 bg-ink-0 shadow-sm">
        <table className="w-full text-left text-13">
          <thead>
            <tr className="micro-label border-b border-ink-200">
              <th className="px-3 py-2 font-normal">Member</th>
              <th className="px-3 py-2 font-normal">Workspace role</th>
              <th className="hidden px-3 py-2 font-normal sm:table-cell">Overrides</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const person = people[m.personId];
              const overrides = overrideCount(m.personId);
              return (
                <tr key={m.personId} className="border-b border-ink-100 last:border-0">
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2.5">
                      {person && <Avatar person={person} size="sm" />}
                      <span className="font-medium text-ink-800">{person?.name}</span>
                      {m.personId === s.actingUserId && (
                        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-400">YOU</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {can("manage") && m.personId !== s.actingUserId ? (
                      <Select
                        aria-label={`Workspace role for ${person?.name}`}
                        className="max-w-32"
                        value={m.role}
                        onChange={(e) => changeRole(m.personId, e.target.value as Role)}
                      >
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </Select>
                    ) : (
                      <span className={can("manage") ? "text-ink-400" : "capitalize text-ink-700"}>
                        {can("manage") ? "You" : m.role}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 tabular text-ink-600 sm:table-cell">
                    {overrides ? `${overrides} folder${overrides === 1 ? "" : "s"}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <Notice tone="info" title="How this is enforced">
          Actions are hidden or disabled based on your role: viewers are read-only, editors can upload and edit,
          owners manage members, retention, and purge; every change is written to the audit log.
        </Notice>
      </div>
    </div>
  );
}
