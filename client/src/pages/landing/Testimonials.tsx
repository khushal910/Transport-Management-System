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
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Dispatch Coordinator',
    company: 'Urban Delivery Services',
    image: 'MC',
    content: 'The dispatch optimization alone has saved us hundreds of hours on manual planning. Routes are 25% shorter, and our customers are happier with faster deliveries. Highly recommended!',
    rating: 5,
    color: 'from-violet-500 to-fuchsia-500'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Safety & Compliance Officer',
    company: 'National Transport Co.',
    image: 'ER',
    content: 'The driver safety monitoring features are outstanding. We\'ve caught risky behaviors early and prevented incidents. The compliance reporting makes audits a breeze.',
    rating: 5,
    color: 'from-emerald-500 to-teal-500'
  }
];

export default function Testimonials() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Customer Stories</p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Trusted by fleet teams who expect more.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            See how modern operators are using FleetFlow to save time, reduce risk, and scale with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-slate-900/90 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-x-0 top-0 h-24 testimonial-overlay opacity-80" />
              <div className="relative z-10 mb-4 text-5xl leading-none text-slate-500">“</div>
              <div className="relative z-10 mb-6 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-amber-400" size={16} />
                ))}
              </div>
              <p className="relative z-10 mb-8 leading-relaxed text-slate-300">
                {testimonial.content}
              </p>
              <div className="relative z-10 flex items-center gap-4 border-t border-slate-700/60 pt-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${testimonial.color} text-white shadow-lg shadow-slate-950/30 transition-transform duration-300 group-hover:scale-110`}>
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-slate-800 pt-16 md:grid-cols-3">
          <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/80 to-slate-950/80 p-6 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="mb-2 text-4xl font-bold text-cyan-300">1000+</div>
            <p className="text-slate-400">Active Fleets</p>
          </div>
          <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/80 to-slate-950/80 p-6 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="mb-2 text-4xl font-bold text-violet-300">50K+</div>
            <p className="text-slate-400">Tracked Vehicles</p>
          </div>
          <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/80 to-slate-950/80 p-6 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="mb-2 text-4xl font-bold text-emerald-300">98%</div>
            <p className="text-slate-400">Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
