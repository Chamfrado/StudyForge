import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
};

export function AuthShell({
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkLabel,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-2">
          <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              StudyForge
            </Link>

            <div>
              <p className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                AI-powered study dashboard
              </p>

              <h1 className="text-4xl font-bold leading-tight">
                Turn your study materials into summaries, flashcards, quizzes
                and analytics.
              </h1>

              <p className="mt-6 text-slate-300">
                A clean portfolio-ready app built with Next.js, FastAPI and AI
                integrations.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Built for focused learning and measurable progress.
            </p>
          </section>

          <section className="bg-white p-8 text-slate-950 sm:p-10">
            <div className="mx-auto max-w-md">
              <Link
                href="/"
                className="mb-8 inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:hidden"
              >
                ← Back to home
              </Link>

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>

              {children}

              <p className="mt-8 text-center text-sm text-slate-500">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {footerLinkLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}