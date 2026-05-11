export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          AI-powered study assistant
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Study smarter with StudyForge.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Upload materials, generate summaries, create flashcards, take quizzes,
          and track your learning performance in one professional dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Create account
          </a>
        </div>
      </section>
    </main>
  );
}