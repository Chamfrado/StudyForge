import { Loader2, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/Card";

export default function DashboardLoadingPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="h-4 w-32 animate-pulse rounded-full bg-indigo-100" />
          <div className="mt-4 h-9 w-72 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>

              <div className="h-12 w-12 animate-pulse rounded-2xl bg-indigo-100" />
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <div>
              <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}