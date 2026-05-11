import { BookOpen, Brain, FileText, Layers3 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const stats = [
  {
    label: "Subjects",
    value: "0",
    icon: BookOpen,
  },
  {
    label: "Materials",
    value: "0",
    icon: FileText,
  },
  {
    label: "Flashcards",
    value: "0",
    icon: Layers3,
  },
  {
    label: "Quizzes",
    value: "0",
    icon: Brain,
  },
];

export default function DashboardPage() {
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
          <Button variant="secondary">Create subject</Button>
          <Button>Upload material</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Latest quiz attempts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your recent quiz performance will appear here.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No quiz attempts yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Generate a quiz from a material and submit your answers to see
              results here.
            </p>
          </div>
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
            <Button variant="secondary" className="w-full justify-start">
              Create a new subject
            </Button>

            <Button variant="secondary" className="w-full justify-start">
              Upload study material
            </Button>

            <Button variant="secondary" className="w-full justify-start">
              Generate flashcards
            </Button>

            <Button variant="secondary" className="w-full justify-start">
              Generate quiz
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}