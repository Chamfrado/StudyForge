"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({
  error,
  reset,
}: DashboardErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <p className="mt-6 text-sm font-semibold text-red-600">
          Dashboard error
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          This dashboard page crashed
        </h1>

        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
          Something unexpected happened while loading this workspace page.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Link href="/dashboard">
            <Button variant="secondary" className="w-full sm:w-auto">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard overview
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}