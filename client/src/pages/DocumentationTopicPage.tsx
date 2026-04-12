import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Lightbulb, ListChecks } from 'lucide-react';
import { githubDocsCatalog } from '@/data/githubDocsCatalog';
import { documentationById } from '@/data/documentationContent';

export default function DocumentationTopicPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/docs" replace />;
  }

  const article = documentationById[slug];
  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-3xl font-bold tracking-tight">Documentation topic not found</p>
          <p className="mt-3 text-sm text-slate-600">
            The requested topic is unavailable or the link may be outdated.
          </p>
          <Link
            to="/docs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to docs hub
          </Link>
        </div>
      </div>
    );
  }

  const catalogEntry = githubDocsCatalog.find((doc) => doc.id === article.id);
  const relatedDocs = githubDocsCatalog.filter((doc) => doc.id !== article.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 10% 15%, rgba(16,185,129,0.16), transparent 40%), radial-gradient(circle at 86% 10%, rgba(14,165,233,0.17), transparent 44%)',
          }}
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
          <Link
            to="/docs"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to documentation
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {catalogEntry?.icon ?? 'Docs'}
                Detailed Guide
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">{article.title}</h1>
              <p className="mt-2 text-base text-slate-600">{article.subtitle}</p>
            </div>

            {catalogEntry ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Route</p>
                <p className="mt-1 font-mono text-xs text-slate-700">{catalogEntry.routePath}</p>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10 lg:px-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-bold tracking-tight">Overview</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{article.overview}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {article.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {article.sections.map((section) => (
            <article key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold tracking-tight">{section.heading}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{section.body}</p>

              {section.points && section.points.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-800" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.example ? (
                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                  <p className="font-semibold">Example</p>
                  <p className="mt-1 leading-6">{section.example}</p>
                </div>
              ) : null}
            </article>
          ))}
        </section>

        {article.workflow ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
              <ListChecks className="h-5 w-5 text-slate-700" />
              {article.workflow.heading}
            </h3>
            <ol className="mt-4 space-y-3">
              {article.workflow.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Best Practices
          </h3>
          <ul className="mt-4 space-y-2">
            {article.bestPractices.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <ClipboardList className="h-5 w-5 text-slate-700" />
            Related Topics
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedDocs.map((doc) => (
              <Link
                key={doc.id}
                to={doc.routePath}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {doc.icon} {doc.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{doc.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
