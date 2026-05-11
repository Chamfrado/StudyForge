"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Layers3,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Flashcard } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getDifficultyVariant(difficulty: string) {
  const normalized = difficulty.toUpperCase();

  if (normalized === "EASY") return "success";
  if (normalized === "MEDIUM") return "warning";
  if (normalized === "HARD") return "danger";

  return "default";
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadFlashcards(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.getFlashcards();

      setFlashcards(response.flashcards);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load flashcards.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadFlashcards();
  }, []);

  const difficulties = useMemo(() => {
    const unique = new Set(
      flashcards.map((flashcard) => flashcard.difficulty.toUpperCase())
    );

    return ["ALL", ...Array.from(unique)];
  }, [flashcards]);

  const filteredFlashcards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return flashcards.filter((flashcard) => {
      const matchesSearch =
        !normalizedSearch ||
        flashcard.front.toLowerCase().includes(normalizedSearch) ||
        flashcard.back.toLowerCase().includes(normalizedSearch) ||
        flashcard.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      const matchesDifficulty =
        difficulty === "ALL" ||
        flashcard.difficulty.toUpperCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [flashcards, search, difficulty]);

  async function handleDelete(flashcardId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(flashcardId);

      await api.deleteFlashcard(flashcardId);

      setFlashcards((current) =>
        current.filter((flashcard) => flashcard.id !== flashcardId)
      );

      toast.success("Flashcard deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete flashcard.";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExportCsv() {
    try {
      setIsExporting(true);

      const blob = await api.exportFlashcardsCsv();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "studyforge-flashcards.csv";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not export CSV.";

      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Flashcards</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Review your generated cards
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Search, filter, review and export your AI-generated flashcards.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => loadFlashcards({ silent: true })}
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

          <Button
            onClick={handleExportCsv}
            disabled={isExporting || flashcards.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </section>

      <Card>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Your flashcards
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {flashcards.length} flashcard
              {flashcards.length === 1 ? "" : "s"} available.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search flashcards..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-64"
              />
            </div>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All difficulties" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading flashcards...
              </p>
            </div>
          </div>
        ) : filteredFlashcards.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredFlashcards.map((flashcard) => (
              <div
                key={flashcard.id}
                className="group flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Layers3 className="h-5 w-5" />
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(flashcard.id)}
                    disabled={deletingId === flashcard.id}
                    className="text-red-600 opacity-100 hover:bg-red-50 hover:text-red-700 md:opacity-0 md:group-hover:opacity-100"
                  >
                    {deletingId === flashcard.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-1 flex-col">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Front
                    </p>

                    <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950">
                      {flashcard.front}
                    </h3>
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Back
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {flashcard.back}
                    </p>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge
                        variant={getDifficultyVariant(flashcard.difficulty)}
                      >
                        {flashcard.difficulty}
                      </Badge>

                      {flashcard.tags?.map((tag) => (
                        <Badge key={`${flashcard.id}-${tag}`} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400">
                      Created on {formatDate(flashcard.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : flashcards.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No flashcards found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing the search term or difficulty filter.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Layers3 className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No flashcards yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload a material and generate flashcards from its detail page.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}