"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  Layers3,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Flashcard, Material, Subject } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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

type GroupedFlashcards = {
  subject: Subject | null;
  subjectName: string;
  flashcards: Flashcard[];
};

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [flashcardsResponse, materialsResponse, subjectsResponse] =
        await Promise.all([
          api.getFlashcards(),
          api.getMaterials(),
          api.getSubjects(),
        ]);

      setFlashcards(flashcardsResponse.flashcards);
      setMaterials(materialsResponse.materials);
      setSubjects(subjectsResponse.subjects);
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
    loadData();
  }, []);

  const materialsById = useMemo(() => {
    return new Map(materials.map((material) => [material.id, material]));
  }, [materials]);

  const subjectsById = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]));
  }, [subjects]);

  const difficulties = useMemo(() => {
    const unique = new Set(
      flashcards.map((flashcard) => flashcard.difficulty.toUpperCase())
    );

    return ["ALL", ...Array.from(unique)];
  }, [flashcards]);

  const subjectOptions = useMemo(() => {
    return [
      {
        id: "ALL",
        name: "All subjects",
      },
      ...subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
      })),
    ];
  }, [subjects]);

  const filteredFlashcards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return flashcards.filter((flashcard) => {
      const material = materialsById.get(flashcard.material_id);
      const subject = material ? subjectsById.get(material.subject_id) : null;

      const matchesSearch =
        !normalizedSearch ||
        flashcard.front.toLowerCase().includes(normalizedSearch) ||
        flashcard.back.toLowerCase().includes(normalizedSearch) ||
        flashcard.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        ) ||
        subject?.name.toLowerCase().includes(normalizedSearch) ||
        material?.title.toLowerCase().includes(normalizedSearch);

      const matchesDifficulty =
        difficulty === "ALL" ||
        flashcard.difficulty.toUpperCase() === difficulty;

      const matchesSubject =
        subjectFilter === "ALL" || material?.subject_id === subjectFilter;

      return matchesSearch && matchesDifficulty && matchesSubject;
    });
  }, [
    flashcards,
    search,
    difficulty,
    subjectFilter,
    materialsById,
    subjectsById,
  ]);

  const groupedFlashcards = useMemo<GroupedFlashcards[]>(() => {
    const groups = new Map<string, GroupedFlashcards>();

    for (const flashcard of filteredFlashcards) {
      const material = materialsById.get(flashcard.material_id);
      const subject = material ? subjectsById.get(material.subject_id) : null;

      const groupKey = subject?.id || "unknown";
      const subjectName = subject?.name || "Unknown subject";

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          subject: subject || null,
          subjectName,
          flashcards: [],
        });
      }

      groups.get(groupKey)?.flashcards.push(flashcard);
    }

    return Array.from(groups.values()).sort((a, b) =>
      a.subjectName.localeCompare(b.subjectName)
    );
  }, [filteredFlashcards, materialsById, subjectsById]);

  function toggleFlip(flashcardId: string) {
    setFlippedCards((current) => ({
      ...current,
      [flashcardId]: !current[flashcardId],
    }));
  }

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

      setFlippedCards((current) => {
        const copy = { ...current };
        delete copy[flashcardId];
        return copy;
      });

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
            Practice with flip cards
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Click a card to reveal the answer. Cards are grouped by subject so
            you can review one study area at a time.
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
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Your flashcards
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {flashcards.length} flashcard
                {flashcards.length === 1 ? "" : "s"} available.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cards, subjects or materials..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-80"
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {subjectOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

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
        ) : groupedFlashcards.length ? (
          <div className="space-y-10">
            {groupedFlashcards.map((group) => (
              <section key={group.subject?.id || group.subjectName}>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-950">
                        {group.subjectName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {group.flashcards.length} card
                        {group.flashcards.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {group.subject && (
                    <Link
                      href={`/dashboard/subjects/${group.subject.id}/analytics`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View subject analytics
                    </Link>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.flashcards.map((flashcard) => {
                    const isFlipped = Boolean(flippedCards[flashcard.id]);
                    const material = materialsById.get(flashcard.material_id);

                    return (
                      <div
                        key={flashcard.id}
                        className="group relative min-h-80 [perspective:1000px]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFlip(flashcard.id)}
                          className="h-full min-h-80 w-full text-left"
                          aria-label={
                            isFlipped
                              ? "Show front of flashcard"
                              : "Show back of flashcard"
                          }
                        >
                          <div
                            className={cn(
                              "relative h-full min-h-80 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]",
                              isFlipped && "[transform:rotateY(180deg)]"
                            )}
                          >
                            <div className="absolute inset-0 flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [backface-visibility:hidden] hover:border-indigo-200 hover:shadow-md">
                              <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <Layers3 className="h-5 w-5" />
                                </div>

                                <Badge
                                  variant={getDifficultyVariant(
                                    flashcard.difficulty
                                  )}
                                >
                                  {flashcard.difficulty}
                                </Badge>
                              </div>

                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Front
                              </p>

                              <h4 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                                {flashcard.front}
                              </h4>

                              <div className="mt-auto pt-6">
                                <p className="text-xs text-slate-400">
                                  Click to reveal answer
                                </p>

                                {material && (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Material: {material.title}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="absolute inset-0 flex h-full flex-col rounded-2xl border border-indigo-200 bg-indigo-950 p-5 text-white shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
                              <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                                  <Layers3 className="h-5 w-5" />
                                </div>

                                <Badge variant="default">Answer</Badge>
                              </div>

                              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                                Back
                              </p>

                              <p className="mt-3 text-sm leading-7 text-indigo-50">
                                {flashcard.back}
                              </p>

                              <div className="mt-auto pt-6">
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {flashcard.tags?.map((tag) => (
                                    <span
                                      key={`${flashcard.id}-${tag}`}
                                      className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-indigo-50"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <p className="text-xs text-indigo-200">
                                  Created on {formatDate(flashcard.created_at)}
                                </p>

                                <p className="mt-2 text-xs text-indigo-200">
                                  Click to return to question
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(flashcard.id)}
                          disabled={deletingId === flashcard.id}
                          className="absolute right-3 top-3 z-10 text-red-600 opacity-100 hover:bg-red-50 hover:text-red-700 md:opacity-0 md:group-hover:opacity-100"
                        >
                          {deletingId === flashcard.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : flashcards.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No flashcards found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing the subject, difficulty or search filter.
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

            <Link href="/dashboard/materials" className="mt-5 inline-flex">
              <Button>Go to materials</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}