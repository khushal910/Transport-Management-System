import { FaMapLocationDot, FaShield, FaRoute, FaGear, FaChartLine, FaRobot } from 'react-icons/fa6';

const features = [
  {
    id: 1,
    icon: FaMapLocationDot,
    title: 'Real-Time Fleet Tracking',
    description: 'Monitor vehicle locations, status, and performance metrics in real-time with live GPS tracking and instant notifications.',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 2,
    icon: FaShield,
    title: 'Driver Safety Monitoring',
    description: 'Track driver behavior, safety scores, and events. Generate automated alerts for speeding, harsh braking, and fatigue.',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 3,
    icon: FaRoute,
    title: 'Smart Trip Management',
    description: 'Optimize routes, manage dispatches, and reduce fuel consumption with intelligent route planning algorithms.',
    color: 'from-violet-500 to-fuchsia-500'
  },
  {
    id: 4,
    icon: FaGear,
    title: 'Maintenance Alerts',
    description: 'Predictive maintenance scheduling, service reminders, and vehicle health monitoring to reduce downtime.',
    color: 'from-sky-500 to-cyan-500'
  },
  {
    id: 5,
    icon: FaChartLine,
    title: 'Analytics & Reporting',
    description: 'Comprehensive insights on fleet performance, fuel efficiency, costs, and KPIs with customizable dashboards.',
    color: 'from-indigo-500 to-violet-500'
  },
  {
    id: 6,
    icon: FaRobot,
    title: 'Intelligent Dispatch',
    description: 'Automated task assignment based on driver availability, vehicle location, and skill matching.',
    color: 'from-cyan-500 to-sky-500'
  }
];

export default function Features() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Modern Fleet Intelligence</p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Powerful features, beautifully designed.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Everything your fleet needs to stay safe, efficient, and profitable — presented in a polished experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/75 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-slate-900/90"
              >
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-linear-to-br ${feature.color} text-white shadow-lg shadow-slate-950/20 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="text-2xl" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="leading-relaxed text-slate-300">{feature.description}</p>
                <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute right-6 top-6 h-2 w-2 rounded-full bg-slate-700 transition-transform duration-300 group-hover:-translate-y-1" />
              </div>
            );
          })}
        </div>

        <div className="mt-16 border-t border-white/10 pt-10 text-center">
          <p className="mb-4 text-slate-300">Ready to modernize your fleet operations with a beautiful, powerful platform?</p>
          <a
            href="/register"
            className="inline-block rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
