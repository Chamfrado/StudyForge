"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <Card className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <p className="mt-6 text-sm font-semibold text-red-600">
          Something went wrong
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          StudyForge could not load this page
        </h1>

        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
          An unexpected error happened. You can try again or return to the home
          page.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}