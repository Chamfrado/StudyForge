"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  FileText,
  Layers3,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type {
  Flashcard,
  GenerateFlashcardsResponse,
  Material,
  Quiz,
  Summary,
} from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusVariant(status: string) {
  if (status === "READY") return "success";
  if (status === "PROCESSING") return "warning";
  if (status === "FAILED") return "danger";
  return "default";
}

export default function MaterialDetailPage() {
  const params = useParams<{ materialId: string }>();
  const router = useRouter();

  const materialId = params.materialId;

  const [material, setMaterial] = useState<Material | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiLoading, setAiLoading] = useState<
    "summary" | "flashcards" | "quiz" | null
  >(null);

  async function loadMaterial() {
    try {
      setIsLoading(true);

      const response = await api.getMaterial(materialId);

      setMaterial(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load material.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMaterial();
  }, [materialId]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?"
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      await api.deleteMaterial(materialId);

      toast.success("Material deleted successfully.");
      router.push("/dashboard/materials");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete material.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleGenerateSummary() {
    try {
      setAiLoading("summary");

      const response = await api.generateSummary(materialId);

      setSummary(response);
      toast.success("Summary generated successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate summary.";

      toast.error(message);
    } finally {
      setAiLoading(null);
    }
  }

  async function handleGenerateFlashcards() {
    try {
      setAiLoading("flashcards");

      const response: GenerateFlashcardsResponse =
        await api.generateFlashcards(materialId);

      setFlashcards(response.flashcards);
      toast.success("Flashcards generated successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate flashcards.";

      toast.error(message);
    } finally {
      setAiLoading(null);
    }
  }

  async function handleGenerateQuiz() {
    try {
      setAiLoading("quiz");

      const response = await api.generateQuiz(materialId);

      setQuiz(response);
      toast.success("Quiz generated successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate quiz.";

      toast.error(message);
    } finally {
      setAiLoading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading material...
          </p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-4 text-xl font-semibold text-slate-950">
          Material not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          This material could not be loaded.
        </p>

        <Link href="/dashboard/materials" className="mt-5 inline-flex">
          <Button variant="secondary">Back to materials</Button>
        </Link>
      </Card>
    );
  }

  const isReady = material.status === "READY";

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Material detail</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {material.title}
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            {material.original_filename}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/materials">
            <Button variant="secondary" className="w-full">
              Back
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">
              File information
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <Badge variant={getStatusVariant(material.status)}>
                  {material.status}
                </Badge>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">File type</span>
                <span className="font-medium uppercase text-slate-900">
                  {material.file_type}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">
                  {formatDate(material.created_at)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-950">
              AI actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generate study resources from this material.
            </p>

            {!isReady && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This material is not ready yet. AI actions are available after
                text extraction finishes.
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={handleGenerateSummary}
                disabled={!isReady || aiLoading !== null}
              >
                {aiLoading === "summary" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate summary
              </Button>

              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={handleGenerateFlashcards}
                disabled={!isReady || aiLoading !== null}
              >
                {aiLoading === "flashcards" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Layers3 className="mr-2 h-4 w-4" />
                )}
                Generate flashcards
              </Button>

              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={handleGenerateQuiz}
                disabled={!isReady || aiLoading !== null}
              >
                {aiLoading === "quiz" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                Generate quiz
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">
              Extracted text preview
            </h2>

            <div className="mt-4 max-h-96 overflow-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
              {material.extracted_text ? (
                <pre className="whitespace-pre-wrap font-sans">
                  {material.extracted_text.slice(0, 4000)}
                  {material.extracted_text.length > 4000 ? "\n\n..." : ""}
                </pre>
              ) : (
                <p className="text-slate-400">
                  No extracted text available yet.
                </p>
              )}
            </div>
          </Card>

          {summary && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-950">
                Generated summary
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {summary.content}
              </p>

              {summary.key_points?.length > 0 && (
                <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {summary.key_points.map((point, index) => (
                    <li key={`${point}-${index}`}>{point}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {flashcards.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-950">
                Generated flashcards
              </h2>

              <div className="mt-5 grid gap-4">
                {flashcards.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {flashcard.front}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {flashcard.back}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {quiz && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-950">
                Generated quiz
              </h2>

              <p className="mt-2 text-sm text-slate-500">{quiz.title}</p>

              {quiz.questions?.length ? (
                <div className="mt-5 space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {index + 1}. {question.question}
                      </p>

                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {question.options.map((option, optionIndex) => (
                          <li key={`${question.id}-${optionIndex}`}>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}

              <Link
                href={`/dashboard/quizzes/${quiz.id}`}
                className="mt-5 inline-flex"
              >
                <Button>Open quiz</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}