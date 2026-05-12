import Link from "next/link";
import { ArrowLeft, LayoutDashboard, SearchX } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardNotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
          <SearchX className="h-8 w-8" />
        </div>

        <p className="mt-6 text-sm font-semibold text-indigo-600">
          Dashboard route not found
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          This workspace page does not exist
        </h1>

        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
          The dashboard page you tried to access could not be found. Go back to
          the overview or return to the previous page.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard overview
            </Button>
          </Link>

          <Link href="/dashboard/subjects">
            <Button variant="secondary" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to subjects
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}