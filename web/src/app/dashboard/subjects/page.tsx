"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Edit3,
  FilePlus2,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must have at least 2 characters."),
  description: z.string().max(500, "Description is too long.").optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function loadSubjects(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.getSubjects();

      setSubjects(response.subjects);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load subjects.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return subjects;

    return subjects.filter((subject) => {
      return (
        subject.name.toLowerCase().includes(normalizedSearch) ||
        subject.description?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [subjects, search]);

  function startCreateMode() {
    setEditingSubject(null);
    reset({
      name: "",
      description: "",
    });
  }

  function startEditMode(subject: Subject) {
    setEditingSubject(subject);

    setValue("name", subject.name);
    setValue("description", subject.description || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function onSubmit(data: SubjectFormData) {
    try {
      setIsSaving(true);

      const payload = {
        name: data.name,
        description: data.description || "",
      };

      if (editingSubject) {
        const updatedSubject = await api.updateSubject(
          editingSubject.id,
          payload
        );

        setSubjects((current) =>
          current.map((subject) =>
            subject.id === updatedSubject.id ? updatedSubject : subject
          )
        );

        toast.success("Subject updated successfully.");
      } else {
        const createdSubject = await api.createSubject(payload);

        setSubjects((current) => [createdSubject, ...current]);

        toast.success("Subject created successfully.");
      }

      setEditingSubject(null);
      reset({
        name: "",
        description: "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save subject.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingSubject) return;

    try {
      setIsDeleting(true);

      await api.deleteSubject(deletingSubject.id);

      setSubjects((current) =>
        current.filter((subject) => subject.id !== deletingSubject.id)
      );

      toast.success("Subject deleted successfully.");
      setDeletingSubject(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete subject.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Subjects</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Organize your study areas
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Create subjects to group your materials, summaries, flashcards,
            quizzes and analytics.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => loadSubjects({ silent: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {editingSubject ? "Edit subject" : "Create subject"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingSubject
                  ? "Update this study area."
                  : "Add a new study area to your workspace."}
              </p>
            </div>

            {editingSubject && (
              <Button variant="ghost" onClick={startCreateMode}>
                New
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject name
              </label>

              <Input placeholder="FastAPI" {...register("name")} />

              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                placeholder="Learning Python backend development with FastAPI."
                className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...register("description")}
              />

              {errors.description && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingSubject ? (
                "Save changes"
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create subject
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Your subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {subjects.length} subject{subjects.length === 1 ? "" : "s"}{" "}
                created.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subjects..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-56"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading subjects...
                </p>
              </div>
            </div>
          ) : filteredSubjects.length ? (
            <div className="space-y-4">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <BookOpen className="h-4 w-4" />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-950">
                          {subject.name}
                        </h3>
                      </div>

                      <p className="max-w-2xl text-sm text-slate-500">
                        {subject.description || "No description provided."}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        Created on {formatDate(subject.created_at)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/dashboard/subjects/${subject.id}/analytics`}
                      >
                        <Button variant="secondary">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Button>
                      </Link>

                      <Link
                        href={`/dashboard/materials/upload?subjectId=${subject.id}`}
                      >
                        <Button variant="secondary">
                          <FilePlus2 className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        onClick={() => startEditMode(subject)}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => setDeletingSubject(subject)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : subjects.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No subjects found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try searching with another name or description.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No subjects yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first subject to start uploading materials.
              </p>
            </div>
          )}
        </Card>
      </section>

      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <Card className="w-full max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              Delete subject?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You are about to delete{" "}
              <span className="font-medium text-slate-900">
                {deletingSubject.name}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingSubject(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete subject"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}