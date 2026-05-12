import Link from "next/link";
import { ArrowLeft, SearchX, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <Card className="w-full max-w-xl border-white/10 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
          <SearchX className="h-8 w-8" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600">
          <Sparkles className="h-4 w-4" />
          StudyForge
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
          The page you are looking for does not exist, was moved, or the link is
          incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">Go to dashboard</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}