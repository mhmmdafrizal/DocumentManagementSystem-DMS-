"use client";

import { useState } from "react";
import { Role } from "@/lib/mock";
import {
  RetentionPolicy,
  roleOf,
  setFolderRole,
  setRetention,
  useCan,
  useMembers,
  useMembersById,
  useStore,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";

const roleLabel: Record<Role, string> = { owner: "Owner", editor: "Editor", viewer: "Viewer" };

export function FolderGovernance({ folderId }: { folderId: string }) {
  const s = useStore();
  const members = useMembers();
  const people = useMembersById();
  const can = useCan(folderId);

  const policy = s.retention[folderId];
  const [mode, setMode] = useState<RetentionPolicy["mode"]>(policy?.mode ?? "keep");
  const [archiveDays, setArchiveDays] = useState(policy?.archiveDays ?? 365);
  const [purgeDays, setPurgeDays] = useState(policy?.purgeDays ?? 730);

  return (
    <div className="mb-4 grid gap-3 lg:grid-cols-2">
      {/* Access (FR-2) — folder-level role overrides */}
      <section className="rounded-radius-lg border border-ink-200 bg-ink-0 p-4 shadow-sm">
        <h2 className="micro-label">Access</h2>
        <p className="mt-1 text-xs text-ink-500">
          Folder roles override the workspace role. Owners can grant per-folder access.
        </p>
        <ul className="mt-3 flex flex-col divide-y divide-ink-100">
          {members.map((m) => {
            const person = people[m.personId];
            const effective = roleOf(s, m.personId, folderId);
            const override = s.folderRoles[folderId]?.[m.personId];
            return (
              <li key={m.personId} className="flex items-center gap-3 py-2">
                <span className="min-w-0 flex-1 truncate text-13 text-ink-800">{person?.name}</span>
                <span className="text-xs tabular text-ink-500">{roleLabel[effective]}</span>
                {can("manage") ? (
                  <Select
                    aria-label={`Role for ${person?.name}`}
                    className="max-w-32"
                    value={override ?? ""}
                    onChange={(e) =>
                      setFolderRole(folderId, m.personId, (e.target.value || m.role) as Role)
                    }
                  >
                    <option value="">Inherit ({roleLabel[m.role]})</option>
                    <option value="owner">Owner</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                ) : (
                  <span className="w-24" />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Retention (FR-10) */}
      <section className="rounded-radius-lg border border-ink-200 bg-ink-0 p-4 shadow-sm">
        <h2 className="micro-label">Retention policy</h2>
        {can("retention") ? (
          <div className="mt-3 flex flex-col gap-3">
            <Field label="Disposition" htmlFor={`ret-mode-${folderId}`}>
              <Select
                id={`ret-mode-${folderId}`}
                value={mode}
                onChange={(e) => setMode(e.target.value as RetentionPolicy["mode"])}
              >
                <option value="keep">Keep forever</option>
                <option value="archive">Auto-archive</option>
                <option value="purge">Auto-archive &amp; purge</option>
              </Select>
            </Field>

            {mode !== "keep" && (
              <Field label="Archive after (days)" htmlFor={`ret-arch-${folderId}`}>
                <input
                  id={`ret-arch-${folderId}`}
                  type="number"
                  min={1}
                  value={archiveDays}
                  onChange={(e) => setArchiveDays(Number(e.target.value))}
                  className="h-8 w-full rounded-radius-sm border border-ink-200 bg-ink-0 px-2.5 text-sm text-ink-800 focus:border-primary-500 focus:outline-none"
                />
              </Field>
            )}
            {mode === "purge" && (
              <Field label="Purge after (days)" htmlFor={`ret-purge-${folderId}`}>
                <input
                  id={`ret-purge-${folderId}`}
                  type="number"
                  min={1}
                  value={purgeDays}
                  onChange={(e) => setPurgeDays(Number(e.target.value))}
                  className="h-8 w-full rounded-radius-sm border border-ink-200 bg-ink-0 px-2.5 text-sm text-ink-800 focus:border-primary-500 focus:outline-none"
                />
              </Field>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  setRetention(folderId, {
                    mode,
                    ...(mode !== "keep" ? { archiveDays } : {}),
                    ...(mode === "purge" ? { purgeDays } : {}),
                  })
                }
              >
                Save policy
              </Button>
              {policy && (
                <span className="text-xs text-ink-500">
                  Current: {policy.mode}
                  {policy.archiveDays ? ` · archive ${policy.archiveDays}d` : ""}
                  {policy.purgeDays ? ` · purge ${policy.purgeDays}d` : ""}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-13 text-ink-600">
            {policy
              ? `${policy.mode}${policy.archiveDays ? ` · archive ${policy.archiveDays}d` : ""}${
                  policy.purgeDays ? ` · purge ${policy.purgeDays}d` : ""
                }`
              : "No policy set. Owners can configure retention."}
          </p>
        )}
      </section>
    </div>
  );
}
