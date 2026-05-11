"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  FileText,
  Layers3,
  Loader2,
  RefreshCcw,
  Target,
  Trophy,
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { SubjectAnalytics } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function SubjectAnalyticsPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params.subjectId;

  const [analytics, setAnalytics] = useState<SubjectAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadAnalytics(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.getSubjectAnalytics(subjectId);

      setAnalytics(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load subject analytics.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [subjectId]);

  const statCards = useMemo(() => {
    return [
      {
        label: "Materials",
        value: analytics?.total_materials ?? 0,
        icon: FileText,
      },
      {
        label: "Flashcards",
        value: analytics?.total_flashcards ?? 0,
        icon: Layers3,
      },
      {
        label: "Quizzes",
        value: analytics?.total_quizzes ?? 0,
        icon: Brain,
      },
      {
        label: "Attempts",
        value: analytics?.total_quiz_attempts ?? 0,
        icon: Target,
      },
      {
        label: "Average score",
        value: formatPercent(analytics?.average_quiz_score ?? 0),
        icon: BarChart3,
      },
      {
        label: "Best score",
        value: formatPercent(analytics?.best_quiz_score ?? 0),
        icon: Trophy,
      },
    ];
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        name: "Materials",
        total: analytics.total_materials,
      },
      {
        name: "Flashcards",
        total: analytics.total_flashcards,
      },
      {
        name: "Quizzes",
        total: analytics.total_quizzes,
      },
      {
        name: "Attempts",
        total: analytics.total_quiz_attempts,
      },
    ];
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading subject analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-slate-500" />

        <h1 className="mt-4 text-xl font-semibold text-slate-950">
          Analytics not found
        </h1>

        <p className="mt-2 text-sm font-medium text-slate-700">
          This subject analytics page could not be loaded.
        </p>

        <Link href="/dashboard/subjects" className="mt-5 inline-flex">
          <Button variant="secondary">Back to subjects</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/dashboard/subjects"
            className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to subjects
          </Link>

          <p className="mt-6 text-sm font-medium text-indigo-600">
            Subject analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {analytics.subject_name}
          </h1>

          <p className="mt-2 max-w-2xl text-slate-700">
            Analyze this subject&apos;s materials, generated resources, quiz
            attempts and performance.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => loadAnalytics({ silent: true })}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Subject resources
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-700">
              Resources generated from this subject.
            </p>
          </div>

          {chartData.some((item) => item.total > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-slate-500" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No subject data yet
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-700">
                Upload materials and generate resources for this subject.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Performance
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-700">
              Quiz performance for this subject.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">
                Average score
              </p>
              <p className="mt-2 text-4xl font-bold text-slate-950">
                {formatPercent(analytics.average_quiz_score)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">
                Best score
              </p>
              <p className="mt-2 text-4xl font-bold text-slate-950">
                {formatPercent(analytics.best_quiz_score)}
              </p>
            </div>

            <Link
              href={`/dashboard/materials/upload?subjectId=${analytics.subject_id}`}
            >
              <Button className="w-full">Upload material for this subject</Button>
            </Link>
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Latest attempts
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Recent quiz attempts for this subject.
          </p>
        </div>

        {analytics.latest_attempts?.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Quiz</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Percentage</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {analytics.latest_attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      <Link
                        href={`/dashboard/quizzes/${attempt.quiz_id}`}
                        className="hover:text-indigo-600"
                      >
                        {attempt.quiz_id.slice(0, 8)}...
                      </Link>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {attempt.score}/{attempt.total_questions}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {formatPercent(attempt.percentage)}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {formatDate(attempt.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <Trophy className="mx-auto h-10 w-10 text-slate-500" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No attempts yet
            </h3>

            <p className="mt-2 text-sm font-medium text-slate-700">
              Complete a quiz generated from this subject to track performance.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}