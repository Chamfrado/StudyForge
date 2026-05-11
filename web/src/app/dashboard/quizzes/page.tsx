"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Eye,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Material, Quiz } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [quizzesResponse, materialsResponse] = await Promise.all([
        api.getQuizzes(),
        api.getMaterials(),
      ]);

      setQuizzes(quizzesResponse.quizzes);
      setMaterials(materialsResponse.materials);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load quizzes.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const materialsById = useMemo(() => {
    return new Map(materials.map((material) => [material.id, material]));
  }, [materials]);

  const filteredQuizzes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return quizzes;

    return quizzes.filter((quiz) => {
      const material = materialsById.get(quiz.material_id);

      return (
        quiz.title.toLowerCase().includes(normalizedSearch) ||
        material?.title.toLowerCase().includes(normalizedSearch) ||
        material?.original_filename.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [quizzes, search, materialsById]);

  async function handleDelete(quizId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(quizId);

      await api.deleteQuiz(quizId);

      setQuizzes((current) => current.filter((quiz) => quiz.id !== quizId));

      toast.success("Quiz deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete quiz.";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Quizzes</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Practice with generated quizzes
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Open a quiz, answer the questions and track your performance over
            time.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => loadData({ silent: true })}
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

          <Link href="/dashboard/materials">
            <Button className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate from material
            </Button>
          </Link>
        </div>
      </section>

      <Card>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Your quizzes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"}{" "}
              available.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search quizzes..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-72"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading quizzes...
              </p>
            </div>
          </div>
        ) : filteredQuizzes.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredQuizzes.map((quiz) => {
              const material = materialsById.get(quiz.material_id);

              return (
                <div
                  key={quiz.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Brain className="h-6 w-6" />
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(quiz.id)}
                      disabled={deletingId === quiz.id}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {deletingId === quiz.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <h3 className="text-lg font-semibold leading-6 text-slate-950">
                    {quiz.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-500">
                    {material
                      ? `Material: ${material.title}`
                      : "Material information unavailable."}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Created on {formatDate(quiz.created_at)}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/dashboard/quizzes/${quiz.id}`}
                      className="flex-1"
                    >
                      <Button className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Open quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : quizzes.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No quizzes found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with another quiz or material name.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Brain className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No quizzes yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Open a material and generate your first quiz.
            </p>

            <Link href="/dashboard/materials" className="mt-5 inline-flex">
              <Button>Go to materials</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}