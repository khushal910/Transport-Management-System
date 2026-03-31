import { Link } from 'react-router-dom';
import { FaArrowRight, FaPlay } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Gradient Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 hover:border-blue-400 transition-colors">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span className="text-sm font-medium text-blue-700">
              Now managing 1000+ fleets worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-gray-900">
              Optimize Your Fleet,
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
              Reduce Costs Today
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            FleetFlow is the all-in-one platform for fleet and logistics management. 
            Track vehicles in real-time, monitor driver safety, manage maintenance, and gain 
            actionable insights with advanced analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 group"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://fleetflow.io/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <FaPlay size={16} />
              Watch Demo
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-4 space-y-2">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">4.9/5</span> rating from 2000+ fleet managers
            </p>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-20 px-4">
          <div className="relative w-full bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-200 overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <FaPlay className="text-white text-lg" />
                </div>
                <p className="text-gray-600 font-medium">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
