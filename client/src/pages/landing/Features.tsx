import { FaMapLocationDot, FaShield, FaRoute, FaGear, FaChartLine, FaRobot } from 'react-icons/fa6';

const features = [
  {
    id: 1,
    icon: FaMapLocationDot,
    title: 'Real-Time Fleet Tracking',
    description: 'Monitor vehicle locations, status, and performance metrics in real-time with live GPS tracking and instant notifications.',
    color: 'bg-blue-600'
  },
  {
    id: 2,
    icon: FaShield,
    title: 'Driver Safety Monitoring',
    description: 'Track driver behavior, safety scores, and events. Generate automated alerts for speeding, harsh braking, and fatigue.',
    color: 'bg-rose-600'
  },
  {
    id: 3,
    icon: FaRoute,
    title: 'Smart Trip Management',
    description: 'Optimize routes, manage dispatches, and reduce fuel consumption with intelligent route planning algorithms.',
    color: 'bg-teal-600'
  },
  {
    id: 4,
    icon: FaGear,
    title: 'Maintenance Alerts',
    description: 'Predictive maintenance scheduling, service reminders, and vehicle health monitoring to reduce downtime.',
    color: 'bg-amber-600'
  },
  {
    id: 5,
    icon: FaChartLine,
    title: 'Analytics & Reporting',
    description: 'Comprehensive insights on fleet performance, fuel efficiency, costs, and KPIs with customizable dashboards.',
    color: 'bg-indigo-600'
  },
  {
    id: 6,
    icon: FaRobot,
    title: 'Intelligent Dispatch',
    description: 'Automated task assignment based on driver availability, vehicle location, and skill matching.',
    color: 'bg-cyan-600'
  }
];

export default function Features() {
  return (
    <section className="bg-transparent px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Powerful Features for Modern Fleets
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Everything you need to manage, monitor, and optimize your fleet operations efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Icon Container */}
                <div className={`${feature.color} mb-5 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="text-white text-2xl" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {feature.description}
                </p>

                {/* Accent Bar */}
                <div className={`${feature.color} absolute bottom-0 left-0 h-1 w-0 rounded-bl-2xl transition-all duration-300 group-hover:w-full`}></div>

                {/* Hover Indicator */}
                <div className="absolute right-6 top-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 border-t border-slate-200 pt-8 text-center">
          <p className="mb-4 text-slate-600">Ready to transform your fleet operations?</p>
          <a
            href="/register"
            className="inline-block rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
