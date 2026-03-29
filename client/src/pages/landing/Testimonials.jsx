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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Trusted by Fleet Managers Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how leading organizations are using FleetFlow to transform their operations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Quote Mark */}
              <div className="text-5xl text-gray-200 mb-4 leading-none">
                "
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" size={16} />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {testimonial.content}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className={`${testimonial.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300`}>
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Accent */}
              <div className={`${testimonial.color} absolute top-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-300 rounded-tl-xl`}></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <p className="text-gray-600">Active Fleets</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
            <p className="text-gray-600">Tracked Vehicles</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <p className="text-gray-600">Customer Satisfaction</p>
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
