import { FaMapLocationDot, FaShield, FaRoute, FaGear, FaChartLine, FaRobot } from 'react-icons/fa6';

const features = [
  {
    id: 1,
    icon: FaMapLocationDot,
    title: 'Real-Time Fleet Tracking',
    description: 'Monitor vehicle locations, status, and performance metrics in real-time with live GPS tracking and instant notifications.',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    icon: FaShield,
    title: 'Driver Safety Monitoring',
    description: 'Track driver behavior, safety scores, and events. Generate automated alerts for speeding, harsh braking, and fatigue.',
    color: 'bg-red-500'
  },
  {
    id: 3,
    icon: FaRoute,
    title: 'Smart Trip Management',
    description: 'Optimize routes, manage dispatches, and reduce fuel consumption with intelligent route planning algorithms.',
    color: 'bg-green-500'
  },
  {
    id: 4,
    icon: FaGear,
    title: 'Maintenance Alerts',
    description: 'Predictive maintenance scheduling, service reminders, and vehicle health monitoring to reduce downtime.',
    color: 'bg-yellow-500'
  },
  {
    id: 5,
    icon: FaChartLine,
    title: 'Analytics & Reporting',
    description: 'Comprehensive insights on fleet performance, fuel efficiency, costs, and KPIs with customizable dashboards.',
    color: 'bg-purple-500'
  },
  {
    id: 6,
    icon: FaRobot,
    title: 'Intelligent Dispatch',
    description: 'Automated task assignment based on driver availability, vehicle location, and skill matching.',
    color: 'bg-indigo-500'
  }
];

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Powerful Features for Modern Fleets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="group relative bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 cursor-pointer"
              >
                {/* Icon Container */}
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white text-2xl" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Accent Bar */}
                <div className={`${feature.color} absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 rounded-bl-xl`}></div>

                {/* Hover Indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">Ready to transform your fleet operations?</p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
