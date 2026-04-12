import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenText,
  Gauge,
  Mail,
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

const highlightFeatures = [
  {
    title: "Smart Assignment Guardrails",
    description:
      "Prevent invalid driver and vehicle assignments before they become operational delays.",
    metric: "42% fewer dispatch conflicts",
    icon: Activity,
  },
  {
    title: "Unified Cost Intelligence",
    description:
      "Correlate fuel, maintenance, toll, and route decisions in one decision-ready timeline.",
    metric: "11% lower monthly cost per km",
    icon: BarChart3,
  },
  {
    title: "Automated Team Communication",
    description:
      "Managers can notify employees instantly through internal email workflows tied to profile actions.",
    metric: "100% lifecycle notifications tracked",
    icon: Mail,
  },
];

const workflowSteps = [
  {
    title: "Prepare",
    detail:
      "Register fleet assets, validate licenses, and enforce role-based permissions before go-live.",
  },
  {
    title: "Dispatch",
    detail:
      "Assign trips confidently using availability, status, and compliance-aware checks.",
  },
  {
    title: "Optimize",
    detail:
      "Review KPI trends, maintenance events, and cost analytics to improve weekly planning.",
  },
];

const testimonials = [
  {
    quote:
      "We replaced fragmented sheets and chat updates with one command center. Dispatch confidence improved in the first week.",
    author: "Nidhi Verma",
    role: "Fleet Operations Manager, NorthStar Carriers",
  },
  {
    quote:
      "Employee onboarding and recovery flows are now clean and auditable. Our managers no longer lose time on account confusion.",
    author: "Rakesh Sharma",
    role: "Regional Transport Lead, VeloGrid Logistics",
  },
  {
    quote:
      "The combined trip and expense visibility changed our route economics conversations from reactive to planned.",
    author: "Samar Patel",
    role: "Finance and Analytics Head, Atlas Freight",
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
            <Link
              to="/register"
              className="hidden items-center rounded-full border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            >
              Register
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
                  className="landing-reveal landing-stat-tile rounded-2xl border border-slate-900/10 bg-white/70 p-4 shadow-sm backdrop-blur"
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

        <section className="mt-14 grid gap-3 rounded-2xl border border-slate-900/10 bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-3">
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Trusted by regional freight teams
          </p>
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800">
            NorthStar Carriers
          </p>
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800">
            Atlas Freight
          </p>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureBlocks.map((feature, index) => (
            <article
              key={feature.title}
              className="landing-reveal landing-interactive-card rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
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

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          {highlightFeatures.map((feature, index) => (
            <article
              key={feature.title}
              className="landing-reveal landing-highlight-card rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm backdrop-blur"
              style={{ animationDelay: `${680 + index * 90}ms` }}
            >
              <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-2.5 text-white">
                <feature.icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Highlighted feature</p>
              <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              <p className="mt-4 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">{feature.metric}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-slate-900/10 bg-white/80 p-7 shadow-lg backdrop-blur">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Execution flow</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">
                One platform from setup to continuous optimization.
              </h2>
            </div>
            <Link
              to="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Open onboarding guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {index + 1}
                </p>
                <p className="mt-3 font-display text-lg font-bold tracking-tight text-slate-900">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Testimonials</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">
                Operational teams using FleetFlow every day.
              </h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.author}
                className="landing-reveal landing-quote-card rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm backdrop-blur"
                style={{ animationDelay: `${900 + index * 100}ms` }}
              >
                <p className="text-sm leading-7 text-slate-700">"{testimonial.quote}"</p>
                <p className="mt-4 font-display text-base font-bold tracking-tight text-slate-900">{testimonial.author}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{testimonial.role}</p>
              </article>
            ))}
          </div>
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

        <footer className="mt-16 rounded-3xl border border-slate-900/10 bg-slate-900 p-8 text-slate-200">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-xl font-bold tracking-tight">FleetFlow</p>
              <p className="mt-2 text-sm text-slate-300">
                Transport management built for operations leaders who need speed, clarity, and control.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Product</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
                <Link to="/vehicles" className="transition hover:text-white">Vehicles</Link>
                <Link to="/trips" className="transition hover:text-white">Trips</Link>
                <Link to="/employees" className="transition hover:text-white">Employees</Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Resources</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link to="/docs" className="transition hover:text-white">Documentation</Link>
                <Link to="/docs/security" className="transition hover:text-white">Security</Link>
                <Link to="/docs/email-notifications" className="transition hover:text-white">Email Workflows</Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link to="/login" className="transition hover:text-white">Login</Link>
                <Link to="/register" className="transition hover:text-white">Register</Link>
                <Link to="/docs/getting-started" className="transition hover:text-white">Setup Guide</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-4 text-xs text-slate-400">
            <p>2026 FleetFlow. Built for modern transport operations.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
