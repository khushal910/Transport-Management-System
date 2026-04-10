import { Outlet, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f6fb]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-30 h-110 w-110 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute -right-35 -top-15 h-100 w-100 rounded-full bg-indigo-200/65 blur-3xl" />
        <div className="absolute -bottom-30 left-1/3 h-90 w-90 rounded-full bg-teal-200/45 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700"
          >
            <FaArrowLeft size={14} />
            Back Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          <section className="hidden rounded-3xl border border-slate-200/70 bg-white/65 p-8 shadow-sm backdrop-blur-sm lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">FleetFlow Platform</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                Modern fleet operations, built for teams that move fast.
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-600">
                Dispatch smarter, track every asset in real time, and collaborate from a clean SaaS workspace inspired by the latest product experiences.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                Live trip visibility with actionable alerts
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                Role-aware workflows for operations and safety
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                Secure account and profile management end-to-end
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/10 sm:p-8">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}
