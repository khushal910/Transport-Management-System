import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  Gauge,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

const featureBlocks = [
  {
    title: "Live Dispatch Visibility",
    description:
      "Track active trips and vehicle movement with instant operational awareness.",
    icon: Route,
  },
  {
    title: "Predictive Maintenance",
    description:
      "Catch service risks early and reduce downtime with maintenance intelligence.",
    icon: Wrench,
  },
  {
    title: "Driver Safety Intelligence",
    description:
      "Monitor behavior trends and safety metrics before incidents become costly.",
    icon: ShieldCheck,
  },
  {
    title: "Fleet Cost Control",
    description:
      "Unify trip, fuel, and expense signals for faster, smarter operational decisions.",
    icon: Gauge,
  },
];

const quickStats = [
  { label: "Connected Vehicles", value: "1,250+" },
  { label: "Daily Trips Managed", value: "18k" },
  { label: "On-Time Delivery", value: "97.4%" },
];

export default function LandingPage() {
  return (
    <div className="landing-surface relative min-h-screen overflow-hidden text-slate-900">
      <div className="landing-grid absolute inset-0" />
      <div className="landing-blob landing-blob-a" />
      <div className="landing-blob landing-blob-b" />
      <div className="landing-blob landing-blob-c" />

      <header className="relative z-20 border-b border-slate-900/10 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">FleetFlow</p>
              <p className="text-xs text-slate-500">Transport Management System</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <BookOpenText className="h-4 w-4" />
              Documentation
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-7">
            <div className="landing-reveal" style={{ animationDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                Real-time Fleet Intelligence
              </span>
            </div>

            <h1
              className="landing-reveal font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "110ms" }}
            >
              Move Every Shipment
              <span className="block landing-gradient-text">With Precision, Not Guesswork.</span>
            </h1>

            <p
              className="landing-reveal max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
              style={{ animationDelay: "220ms" }}
            >
              FleetFlow unifies vehicles, drivers, trips, expenses, and compliance into one
              operational cockpit. Dispatch faster, reduce downtime, and improve delivery confidence.
            </p>

            <div
              className="landing-reveal flex flex-wrap items-center gap-3"
              style={{ animationDelay: "320ms" }}
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Explore Product Docs
              </Link>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {quickStats.map((stat, index) => (
                <article
                  key={stat.label}
                  className="landing-reveal rounded-2xl border border-slate-900/10 bg-white/70 p-4 shadow-sm backdrop-blur"
                  style={{ animationDelay: `${420 + index * 90}ms` }}
                >
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="landing-reveal rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl" style={{ animationDelay: "220ms" }}>
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg font-bold">Operations Pulse</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 landing-ping" />
                Live
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Trips In Progress</span>
                  <span className="font-bold text-slate-900">148</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[78%] rounded-full bg-emerald-500 landing-progress" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Vehicles Available</span>
                  <span className="font-bold text-slate-900">326</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[64%] rounded-full bg-cyan-500 landing-progress" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Safety Score</span>
                  <span className="font-bold text-slate-900">94.7%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[94%] rounded-full bg-amber-500 landing-progress" />
                </div>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-900/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Jump To Dashboard
            </Link>
          </aside>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureBlocks.map((feature, index) => (
            <article
              key={feature.title}
              className="landing-reveal rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${520 + index * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-2.5 text-white">
                <feature.icon className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 landing-reveal rounded-3xl border border-slate-900/10 bg-white/80 p-7 shadow-lg backdrop-blur" style={{ animationDelay: "900ms" }}>
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="font-display text-2xl font-black tracking-tight">Ready to simplify your transport operations?</p>
              <p className="mt-1 text-sm text-slate-600">
                Launch with role-based workflows, live KPIs, and documentation your team can actually use.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/docs" className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
                <Users className="h-4 w-4" />
                Read Docs
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
