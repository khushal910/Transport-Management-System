import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookText, FileCode2, Search, Tag } from "lucide-react";
import { githubDocsCatalog } from "@/data/githubDocsCatalog";
import { documentationById } from "@/data/documentationContent";

export default function DocumentationPage() {
  const [query, setQuery] = useState("");

  const filteredDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return githubDocsCatalog;

    return githubDocsCatalog.filter((doc) => {
      const details = documentationById[doc.id];
      return (
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.description.toLowerCase().includes(normalizedQuery) ||
        doc.routePath.toLowerCase().includes(normalizedQuery) ||
        details?.overview.toLowerCase().includes(normalizedQuery) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [query]);

  const totalTags = useMemo(() => {
    const tags = new Set<string>();
    githubDocsCatalog.forEach((doc) => doc.tags.forEach((tag) => tags.add(tag)));
    return tags.size;
  }, []);

  const featuredDocs = useMemo(() => githubDocsCatalog.slice(0, 3), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 opacity-80" style={{ background: "radial-gradient(circle at 10% 20%, rgba(16,185,129,0.16), transparent 35%), radial-gradient(circle at 90% 10%, rgba(14,165,233,0.18), transparent 38%)" }} />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-12 lg:px-10">
          <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <BookText className="h-3.5 w-3.5" />
                Documentation Hub
              </p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight">FleetFlow Product Documentation</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Explore production-ready guides for core modules, security controls, and employee lifecycle workflows.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div>
                <p className="text-xl font-extrabold">{githubDocsCatalog.length}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</p>
              </div>
              <div>
                <p className="text-xl font-extrabold">{totalTags}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</p>
              </div>
              <div>
                <p className="text-xl font-extrabold">Live</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sync</p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search docs by title, topic, route, or tag..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {featuredDocs.map((doc) => (
              <Link
                key={doc.id}
                to={doc.routePath}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-bold text-slate-900">
                  {doc.icon} {doc.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{doc.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
        {filteredDocs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-display text-2xl font-bold">No Documentation Matches</p>
            <p className="mt-2 text-sm text-slate-600">Try searching by module names like fleet, driver, rbac, or security.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredDocs.map((doc, index) => (
              <article
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ animation: "landingReveal 0.6s ease forwards", animationDelay: `${index * 70}ms`, opacity: 0 }}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl" aria-hidden>
                      {doc.icon}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold tracking-tight">{doc.title}</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {doc.routePath}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">{doc.description}</p>

                <p className="mt-2 text-sm text-slate-500">
                  {documentationById[doc.id]?.sections[0]?.body}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detailed module guide</span>
                  <Link
                    to={doc.routePath}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-900/15 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-900 hover:text-white"
                  >
                    Read details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
