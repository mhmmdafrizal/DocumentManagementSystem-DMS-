"use client";

import { DocVersion } from "@/lib/mock";
import { VersionList } from "@/components/dms/version-list";

export function VersionListWrapper({ docId, versions, current }: { docId: string; versions: DocVersion[]; current: number }) {
  return <VersionList docId={docId} versions={versions} current={current} />;
}