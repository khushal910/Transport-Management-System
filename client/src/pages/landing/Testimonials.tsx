import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fleet Operations Manager',
    company: 'Express Logistics Inc.',
    image: 'SJ',
    content: 'FleetFlow has transformed how we manage our 200-vehicle fleet. We\'ve reduced fuel costs by 18% and improved driver safety significantly. The real-time tracking and analytics are game-changers.',
    rating: 5,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Dispatch Coordinator',
    company: 'Urban Delivery Services',
    image: 'MC',
    content: 'The dispatch optimization alone has saved us hundreds of hours on manual planning. Routes are 25% shorter, and our customers are happier with faster deliveries. Highly recommended!',
    rating: 5,
    color: 'bg-purple-500'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Safety & Compliance Officer',
    company: 'National Transport Co.',
    image: 'ER',
    content: 'The driver safety monitoring features are outstanding. We\'ve caught risky behaviors early and prevented incidents. The compliance reporting makes audits a breeze.',
    rating: 5,
    color: 'bg-green-500'
  }
];

export default function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Trusted by Fleet Managers Worldwide
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            See how leading organizations are using FleetFlow to transform their operations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Quote Mark */}
              <div className="mb-4 text-5xl leading-none text-slate-200">
                "
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" size={16} />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="mb-6 leading-relaxed text-slate-700">
                {testimonial.content}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                <div className={`${testimonial.color} flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white transition-transform duration-300 group-hover:scale-110`}>
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Accent */}
              <div className={`${testimonial.color} absolute left-0 top-0 h-0 w-1 rounded-tl-2xl transition-all duration-300 group-hover:h-full`}></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-slate-200 pt-16 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-4xl font-bold text-blue-700">1000+</div>
            <p className="text-slate-600">Active Fleets</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-4xl font-bold text-blue-700">50K+</div>
            <p className="text-slate-600">Tracked Vehicles</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-4xl font-bold text-blue-700">98%</div>
            <p className="text-slate-600">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
