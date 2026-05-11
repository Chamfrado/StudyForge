"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getDifficultyVariant(difficulty: string) {
  const normalized = difficulty.toUpperCase();

  if (normalized === "EASY") return "success";
  if (normalized === "MEDIUM") return "warning";
  if (normalized === "HARD") return "danger";

  return "default";
}

function getOptionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export default function QuizDetailPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = params.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [quizResponse, attemptsResponse] = await Promise.all([
        api.getQuiz(quizId),
        api.getQuizAttempts(quizId),
      ]);

      setQuiz(quizResponse);
      setAttempts(attemptsResponse.attempts);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load quiz.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [quizId]);

  const questions = quiz?.questions || [];

  const answeredCount = useMemo(() => {
    return questions.filter((question) => selectedAnswers[question.id]).length;
  }, [questions, selectedAnswers]);

  const canSubmit = questions.length > 0 && answeredCount === questions.length;

  const latestAttemptAnswersByQuestionId = useMemo(() => {
    if (!latestAttempt) return new Map<string, string>();

    return new Map(
      latestAttempt.answers.map((answer) => [
        answer.question_id,
        answer.correct_answer,
      ])
    );
  }, [latestAttempt]);

  const latestAttemptSelectedByQuestionId = useMemo(() => {
    if (!latestAttempt) return new Map<string, string>();

    return new Map(
      latestAttempt.answers.map((answer) => [
        answer.question_id,
        answer.selected_answer,
      ])
    );
  }, [latestAttempt]);

  function selectAnswer(questionId: string, answer: string) {
    if (latestAttempt) return;

    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function resetAttemptForm() {
    setSelectedAnswers({});
    setLatestAttempt(null);
  }

  async function handleSubmitAttempt() {
    if (!quiz) return;

    if (!canSubmit) {
      toast.error("Answer all questions before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.submitQuizAttempt(quiz.id, {
        answers: questions.map((question) => ({
          question_id: question.id,
          selected_answer: selectedAnswers[question.id],
        })),
      });

      setLatestAttempt(response);
      setAttempts((current) => [response, ...current]);

      toast.success(`Quiz submitted. Score: ${formatPercent(response.percentage)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not submit attempt.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <Brain className="mx-auto h-10 w-10 text-slate-400" />

        <h1 className="mt-4 text-xl font-semibold text-slate-950">
          Quiz not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This quiz could not be loaded.
        </p>

        <Link href="/dashboard/quizzes" className="mt-5 inline-flex">
          <Button variant="secondary">Back to quizzes</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/dashboard/quizzes"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quizzes
          </Link>

          <p className="mt-6 text-sm font-medium text-indigo-600">
            Quiz attempt
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {quiz.title}
          </h1>

          <p className="mt-2 text-slate-500">
            {questions.length} question{questions.length === 1 ? "" : "s"}.
            Answer all questions and submit your attempt.
          </p>
        </div>

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
      </section>

      {latestAttempt && (
        <Card className="border-indigo-200 bg-indigo-50">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <Trophy className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-700">
                  Latest result
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {latestAttempt.score}/{latestAttempt.total_questions} -{" "}
                  {formatPercent(latestAttempt.percentage)}
                </h2>
              </div>
            </div>

            <Button variant="secondary" onClick={resetAttemptForm}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {questions.length ? (
            questions.map((question, index) => {
              const selectedAnswer = selectedAnswers[question.id];
              const correctAnswer =
                latestAttemptAnswersByQuestionId.get(question.id);
              const latestSelected =
                latestAttemptSelectedByQuestionId.get(question.id);

              return (
                <Card key={question.id}>
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant={getDifficultyVariant(question.difficulty)}>
                          {question.difficulty}
                        </Badge>

                        <span className="text-xs text-slate-400">
                          Question {index + 1}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold leading-7 text-slate-950">
                        {question.question}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const letter = getOptionLetter(optionIndex);
                      const isSelected = selectedAnswer === letter;
                      const wasSelected = latestSelected === letter;
                      const isCorrect = correctAnswer === letter;

                      return (
                        <button
                          key={`${question.id}-${letter}`}
                          type="button"
                          onClick={() => selectAnswer(question.id, letter)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition",
                            !latestAttempt &&
                              isSelected &&
                              "border-indigo-300 bg-indigo-50 text-indigo-900",
                            !latestAttempt &&
                              !isSelected &&
                              "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50",
                            latestAttempt &&
                              isCorrect &&
                              "border-emerald-300 bg-emerald-50 text-emerald-900",
                            latestAttempt &&
                              wasSelected &&
                              !isCorrect &&
                              "border-red-300 bg-red-50 text-red-900",
                            latestAttempt &&
                              !wasSelected &&
                              !isCorrect &&
                              "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                              isSelected &&
                                !latestAttempt &&
                                "border-indigo-600 bg-indigo-600 text-white",
                              latestAttempt &&
                                isCorrect &&
                                "border-emerald-600 bg-emerald-600 text-white",
                              latestAttempt &&
                                wasSelected &&
                                !isCorrect &&
                                "border-red-600 bg-red-600 text-white"
                            )}
                          >
                            {letter}
                          </span>

                          <span className="flex-1">{option}</span>

                          {latestAttempt && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          )}

                          {latestAttempt && wasSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {latestAttempt && question.explanation && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-900">
                        Explanation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="text-center">
              <Brain className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No questions found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This quiz does not have questions available.
              </p>
            </Card>
          )}

          {questions.length > 0 && !latestAttempt && (
            <Card>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Submit your attempt
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {answeredCount}/{questions.length} questions answered.
                  </p>
                </div>

                <Button
                  onClick={handleSubmitAttempt}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit answers"
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">
              Attempt progress
            </h2>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Answered</span>
                <span className="font-medium text-slate-900">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{
                    width: questions.length
                      ? `${(answeredCount / questions.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-950">
              Attempt history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Previous results for this quiz.
            </p>

            {attempts.length ? (
              <div className="mt-5 space-y-3">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {formatPercent(attempt.percentage)}
                        </p>

                        <p className="text-sm text-slate-500">
                          {attempt.score}/{attempt.total_questions} correct
                        </p>
                      </div>

                      <Badge
                        variant={
                          attempt.percentage >= 70 ? "success" : "warning"
                        }
                      >
                        {attempt.percentage >= 70 ? "Good" : "Review"}
                      </Badge>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      {formatDate(attempt.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <Trophy className="mx-auto h-8 w-8 text-slate-400" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No attempts yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Submit your first attempt to see your result here.
                </p>
              </div>
            )}
          </Card>
        </aside>
      </section>
    </div>
  );
}
