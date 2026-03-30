import { Outlet, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Header with back button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors mb-6"
          >
            <FaArrowLeft size={16} />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FleetFlow</h1>
          <p className="text-gray-600">Fleet & Logistics Management Platform</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-lg p-8 backdrop-blur-sm">
          <Outlet />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure authentication • No spam • GDPR Compliant
          </p>
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
    </div>
  );
}
