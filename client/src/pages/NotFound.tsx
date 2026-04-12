import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-24">
      <div className="w-full max-w-md">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="text-5xl font-bold">404</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-center text-3xl font-bold text-slate-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-center text-slate-600 mb-2">
            The route you're looking for doesn't exist.
          </p>
          <p className="text-center text-sm text-slate-500 font-mono bg-slate-50 rounded-lg p-3 mb-6">
            {location.pathname}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <a
              href="mailto:support@fleetflow.com"
              className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              <Headphones className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Error Code: 404 | FleetFlow Management System
        </p>
      </div>
    </main>
  );
};

export default NotFound;
