import { Link } from 'react-router-dom';
import { FaArrowRight, FaPlay } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="relative overflow-visible px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_26%)]" />
      <div className="pointer-events-none absolute -left-10 top-28 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-20 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle,_rgba(59,130,246,0.2),_transparent_60%)] blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mx-auto max-w-4xl space-y-10 text-center text-slate-100">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-lg shadow-slate-950/10 backdrop-blur-lg animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce-slow" />
            Trusted by leading fleets for smarter operations
          </div>

          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl font-black tracking-tight leading-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">Optimize fleet operations</span>
              <span className="block bg-linear-to-r from-cyan-300 via-blue-300 to-fuchsia-400 bg-clip-text text-transparent leading-tight">
                with real-time telematics and intelligent automation
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              FleetFlow delivers real-time tracking, driver safety insights, and predictive maintenance in one elegant platform.
              Keep your vehicles connected, compliant, and moving with confidence.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row animate-fade-in">
            <Link
              to="/auth/register"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              Get Started Free
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="https://fleetflow.io/demo"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-slate-950/80 px-8 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-cyan-300 hover:bg-slate-900/90"
            >
              <FaPlay size={16} />
              Watch Demo
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center gap-1 text-amber-300">
              {[...Array(5)].map((_, index) => (
                <span key={index} className="text-xl">★</span>
              ))}
            </div>
            <p className="text-sm text-slate-300">
              Rated 4.9/5 by over 2,000 fleet managers worldwide.
            </p>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/55 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl animate-fade-up sm:p-6">
            <div className="absolute inset-x-0 top-0 h-28 hero-radial-glow" />
            <div className="relative aspect-video overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70">
              <div className="absolute inset-0 hero-radial-overlay" />
              <div className="absolute inset-0 hero-linear-overlay" />
              <div className="relative flex h-full items-center justify-center px-6 text-center">
                <div>
                  <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-cyan-400 to-violet-500 shadow-[0_0_40px_rgba(59,130,246,0.22)] animate-bounce-slow">
                    <FaPlay className="text-white text-lg" />
                  </div>
                  <p className="font-semibold text-white">Dashboard Preview</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Operations, safety, and cost control in one elegant workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
