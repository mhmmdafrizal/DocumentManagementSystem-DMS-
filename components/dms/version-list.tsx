"use client";

import { useState } from "react";
import { DocVersion, peopleById, fullDate } from "@/lib/mock";
import { restoreVersion, useCan } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { RevTriangle } from "@/components/ui/rev";

export function VersionList({ docId, versions, current }: { docId: string; versions: DocVersion[]; current: number }) {
  const people = peopleById();
  const can = useCan();
  const [restoring, setRestoring] = useState<number | null>(null);
  const [restoredFrom, setRestoredFrom] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {restoredFrom && (
        <Notice tone="success" title="Version restored">
          A new version (v{versions.length + 1}) was created from v{restoredFrom}. History was not rewritten.
        </Notice>
      )}
      <ol className="relative flex flex-col">
        {versions.map((v, i) => {
          const isCurrent = v.no === current;
          const isActive = restoring === v.no;
          return (
            <li key={v.no} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex w-7 shrink-0 flex-col items-center">
                <RevTriangle
                  n={v.no}
                  className={`h-6 w-6 shrink-0 ${isCurrent ? "text-primary-600" : v.isRestore ? "text-revision" : "text-ink-400"}`}
                />
                {i < versions.length - 1 && <span className="mt-1 w-px flex-1 bg-ink-200" aria-hidden />}
              </div>

              <div
                className={`min-w-0 flex-1 rounded-radius-sm border border-ink-200 bg-ink-0 p-3 shadow-sm ${
                  isCurrent ? "change-bar" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="drawing-no text-13 font-semibold text-ink-900">
                    REV {String(v.no).padStart(2, "0")}
                  </span>
                  {isCurrent && (
                    <span className="rounded-radius-sm border border-primary-600/35 bg-primary-50 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.12em] text-primary-700">
                      CURRENT
                    </span>
                  )}
                  {v.pinned && (
                    <span className="rounded-radius-sm border border-ink-200 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-500">
                      PINNED
                    </span>
                  )}
                  {v.isRestore && (
                    <span className="rounded-radius-sm border border-revision/40 bg-danger-50 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-revision">
                      RESTORED
                    </span>
                  )}
                  <span className="ml-auto drawing-no text-xs text-ink-400">{v.size}</span>
                </div>
                <p className="mt-1.5 text-13 text-ink-700">{v.changeSummary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  <Avatar person={people[v.authorId]} size="xs" />
                  <span className="text-ink-700">{v.user}</span>
                  <span className="drawing-no" title={fullDate(v.createdAt)}>· {fullDate(v.createdAt)}</span>
                </div>
                {!isCurrent && can("restore") && (
                  <div className="mt-2.5">
                    {isActive ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-radius-sm border border-ink-200 bg-ink-50 p-2.5">
                        <div className="min-w-0 flex-1 text-xs text-ink-600">
                          Restoring creates{" "}
                          <span className="font-medium text-ink-800">new version v{versions.length + 1}</span> from
                          v{v.no}. History is not rewritten.
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            restoreVersion(docId, v.no);
                            setRestoring(null);
                            setRestoredFrom(v.no);
                          }}
                        >
                          Confirm restore
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRestoring(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRestoring(v.no)}
                        aria-label={`Restore version v${v.no} as new version`}
                      >
                        Restore as new version
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
