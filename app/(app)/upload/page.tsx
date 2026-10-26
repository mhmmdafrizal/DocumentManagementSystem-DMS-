"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileType } from "@/lib/mock";
import { addDocument, useCan, useFolders } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { VersionBadge } from "@/components/ui/chip";
import { DropZone } from "@/components/dms/dropzone";

const fileTypeFrom = (name: string): FileType => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return (["pdf", "docx", "xlsx", "png", "jpg", "txt", "md"] as FileType[]).includes(ext as FileType)
    ? (ext as FileType)
    : "pdf";
};

export default function UploadPage() {
  const router = useRouter();
  const can = useCan();
  const folders = useFolders().filter((f) => f.parentId === null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [folderId, setFolderId] = useState(folders[0]?.id ?? "");
  const [done, setDone] = useState<string | null>(null);

  if (!can("upload")) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Breadcrumbs items={[{ label: "Upload" }]} />
        <div className="mt-4">
          <Notice tone="warning" title="Read-only access">
            Your role doesn&apos;t allow uploading. Ask an owner to grant you Editor.
          </Notice>
        </div>
      </div>
    );
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = addDocument({
      title: title.trim() || file?.name || "Untitled document",
      description: description.trim(),
      folderId: folderId || null,
      fileType: file ? fileTypeFrom(file.name) : "pdf",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      category: category || "Draft",
    });
    setDone(doc.id);
  };

  if (done) {
    const folderName = folders.find((f) => f.id === folderId)?.name ?? "Unfiled";
    return (
      <div className="mx-auto max-w-lg p-6">
        <Notice tone="success" title="Document saved">
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            Uploaded to <span className="font-medium">{folderName}</span> as
            <VersionBadge no={1} />
            This action is audit-logged.
          </span>
        </Notice>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" size="sm" onClick={() => router.push(`/documents/${done}`)}>
            Open document
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/folders")}>
            Go to Folders
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDone(null);
              setFile(null);
              setTitle("");
              setDescription("");
              setTags("");
              setCategory("");
            }}
          >
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Breadcrumbs items={[{ label: "Upload" }]} />
      <h1 className="mt-3 text-xl font-semibold text-ink-900">Upload a document</h1>
      <p className="mt-1 text-sm text-ink-500">Add to the register. The revision history starts at REV 01 on save.</p>

      <form onSubmit={save} className="mt-6 flex flex-col gap-5">
        <DropZone onAccepted={(f) => { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }} />

        {file && (
          <Notice tone="info" title="Staged file">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </Notice>
        )}

        <Field label="Title" htmlFor="title" required>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master Services Agreement — Zephyr Tech" />
        </Field>

        <Field label="Description" htmlFor="desc">
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description to help others find this document." />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tags" htmlFor="tags" hint="Up to 10, comma separated">
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="contract, legal, audit" />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select…</option>
              <option>Signed contract</option>
              <option>Draft</option>
              <option>Procedure</option>
              <option>Report</option>
              <option>Template</option>
              <option>Published policy</option>
            </Select>
          </Field>
        </div>

        <Field label="Folder" htmlFor="folder">
          <Select id="folder" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-2">
          <Button type="submit">Save document</Button>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
