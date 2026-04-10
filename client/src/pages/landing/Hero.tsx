import { Link } from 'react-router-dom';
import { FaArrowRight, FaPlay } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-36">
      <div className="max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[8%] -top-35 h-90 w-90 rounded-full bg-blue-200/45 blur-3xl" />
          <div className="absolute right-[8%] -top-25 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
          <div className="absolute -bottom-40 left-1/2 h-95 w-95 -translate-x-1/2 rounded-full bg-teal-200/35 blur-3xl" />
        </div>

        <div className="space-y-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
              Now managing 1000+ fleets worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            <span className="block">
              Optimize Your Fleet,
            </span>
            <span className="block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Reduce Costs Today
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
            FleetFlow is the all-in-one platform for fleet and logistics management. 
            Track vehicles in real-time, monitor driver safety, manage maintenance, and gain 
            actionable insights with advanced analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Link
              to="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://fleetflow.io/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50"
            >
              <FaPlay size={16} />
              Watch Demo
            </a>
          </div>

          {/* Social Proof */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">4.9/5</span> rating from 2000+ fleet managers
            </p>
          </div>
        </div>

        <div className="mt-16 px-2 sm:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-r from-blue-50 via-indigo-50 to-cyan-50" />
            <div className="relative aspect-video rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-100 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30">
                  <FaPlay className="text-white text-lg" />
                </div>
                <p className="font-semibold text-slate-700">Dashboard Preview</p>
                <p className="text-sm text-slate-500">Operations, safety, and costs in one modern workspace</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
