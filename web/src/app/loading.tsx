import { Sparkles } from "lucide-react";

export default function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-2xl">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Loading StudyForge
        </h1>

        <p className="mt-2 text-sm font-medium text-slate-300">
          Preparing your study workspace...
        </p>

        <div className="mx-auto mt-6 h-2 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-400" />
        </div>
      </div>
    </main>
  );
}