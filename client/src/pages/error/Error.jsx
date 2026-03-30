import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHeadset } from 'react-icons/fa';

export default function Error() {
  return (
    <>
      <main className="min-h-screen bg-white flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <p className="text-3xl font-bold text-blue-600">404</p>
          </div>
          
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Page Not Found
          </h1>
          
          <p className="mt-6 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for. Let's get you back on track.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <FaArrowLeft size={16} />
              Go Back Home
            </Link>
            
            <a
              href="mailto:support@fleetflow.io"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
            >
              <FaHeadset size={16} />
              Contact Support
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Need help? Visit our <Link to="/docs" className="font-semibold text-blue-600 hover:text-blue-700">documentation</Link>
          </p>
        </div>
      </main>
    </>
  );
}
