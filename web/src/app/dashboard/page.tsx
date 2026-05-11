"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Brain,
  FileText,
  Layers3,
  Loader2,
  RefreshCcw,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { AnalyticsOverview } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadOverview(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      const data = await api.getAnalyticsOverview();

      setOverview(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load analytics.";

      setErrorMessage(message);

      if (!options?.silent) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: "Subjects",
        value: overview?.total_subjects ?? 0,
        icon: BookOpen,
      },
      {
        label: "Materials",
        value: overview?.total_materials ?? 0,
        icon: FileText,
      },
      {
        label: "Flashcards",
        value: overview?.total_flashcards ?? 0,
        icon: Layers3,
      },
      {
        label: "Quizzes",
        value: overview?.total_quizzes ?? 0,
        icon: Brain,
      },
      {
        label: "Attempts",
        value: overview?.total_quiz_attempts ?? 0,
        icon: BarChart3,
      },
      {
        label: "Average score",
        value: formatPercent(overview?.average_quiz_score ?? 0),
        icon: Trophy,
      },
      {
        label: "Best score",
        value: formatPercent(overview?.best_quiz_score ?? 0),
        icon: Trophy,
      },
    ];
  }, [overview]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <BarChart3 className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-slate-950">
            Could not load dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>

          <Button className="mt-6" onClick={() => loadOverview()}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Dashboard Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Your study workspace
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Track your subjects, materials, flashcards, quizzes and learning
            performance from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => loadOverview({ silent: true })}
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

          <Link href="/dashboard/subjects">
            <Button variant="secondary" className="w-full">
              Create subject
            </Button>
          </Link>

          <Link href="/dashboard/materials/upload">
            <Button className="w-full">Upload material</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Latest quiz attempts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recent quiz performance.
              </p>
            </div>

            <Link
              href="/dashboard/quizzes"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View quizzes
            </Link>
          </div>

          {overview?.latest_attempts?.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Quiz</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Percentage</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {overview.latest_attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/dashboard/quizzes/${attempt.quiz_id}`}
                          className="hover:text-indigo-600"
                        >
                          {attempt.quiz_id.slice(0, 8)}...
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {attempt.score}/{attempt.total_questions}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {formatPercent(attempt.percentage)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(attempt.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No quiz attempts yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Generate a quiz from a material and submit your answers to see
                results here.
              </p>

              <Link href="/dashboard/materials" className="mt-5 inline-flex">
                <Button variant="secondary">Go to materials</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Start building your study base.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/subjects">
              <Button variant="secondary" className="w-full justify-start">
                Create a new subject
              </Button>
            </Link>

            <Link href="/dashboard/materials/upload">
              <Button variant="secondary" className="w-full justify-start">
                Upload study material
              </Button>
            </Link>

            <Link href="/dashboard/flashcards">
              <Button variant="secondary" className="w-full justify-start">
                Review flashcards
              </Button>
            </Link>

            <Link href="/dashboard/quizzes">
              <Button variant="secondary" className="w-full justify-start">
                Take a quiz
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}