"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const allowedExtensions = [".txt", ".md", ".pdf", ".docx"];

export default function UploadMaterialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subjectIdFromUrl = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState(subjectIdFromUrl || "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const selectedFileExtension = useMemo(() => {
    if (!file) return null;

    const fileName = file.name.toLowerCase();
    return allowedExtensions.find((extension) => fileName.endsWith(extension));
  }, [file]);

  async function loadSubjects() {
    try {
      setIsLoadingSubjects(true);

      const response = await api.getSubjects();

      setSubjects(response.subjects);

      if (!subjectIdFromUrl && response.subjects.length) {
        setSubjectId(response.subjects[0].id);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load subjects.";

      toast.error(message);
    } finally {
      setIsLoadingSubjects(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();

    const isAllowed = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension)
    );

    if (!isAllowed) {
      toast.error("Unsupported file type. Use .txt, .md, .pdf or .docx.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);

    if (!title) {
      const titleFromFile = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(titleFromFile);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subjectId) {
      toast.error("Select a subject.");
      return;
    }

    if (!title.trim()) {
      toast.error("Enter a title.");
      return;
    }

    if (!file) {
      toast.error("Select a file.");
      return;
    }

    try {
      setIsUploading(true);

      const uploadedMaterial = await api.uploadMaterial({
        subject_id: subjectId,
        title: title.trim(),
        file,
      });

      toast.success("Material uploaded successfully.");
      router.push(`/dashboard/materials/${uploadedMaterial.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not upload material.";

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600">Upload material</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Add a new study file
        </h1>

        <p className="mt-2 text-slate-500">
          Upload a study material and StudyForge will extract its text so you
          can generate summaries, flashcards and quizzes.
        </p>
      </section>

      <Card>
        {isLoadingSubjects ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading subjects...
              </p>
            </div>
          </div>
        ) : subjects.length ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>

              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Introduction to FastAPI"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                File
              </label>

              <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
                <FileUp className="h-10 w-10 text-indigo-600" />

                <p className="mt-4 text-sm font-medium text-slate-900">
                  {file ? file.name : "Click to choose a file"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Supported files: .txt, .md, .pdf, .docx
                </p>

                {selectedFileExtension && (
                  <p className="mt-2 text-xs font-medium uppercase text-indigo-600">
                    {selectedFileExtension.replace(".", "")}
                  </p>
                )}

                <input
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard/materials")}
                disabled={isUploading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload material
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Create a subject first
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Materials need to be linked to a subject.
            </p>

            <Button
              className="mt-5"
              onClick={() => router.push("/dashboard/subjects")}
            >
              Go to subjects
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
