import { Outlet, Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck } from 'react-icons/fa';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <section className="hidden flex-1 flex-col justify-between bg-slate-950 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500">
            <FaTruck className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FleetFlow</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Manage your fleet
            <br />
            with confidence.
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Track vehicles, manage trips, monitor expenses, and optimize your fleet operations in one unified workspace.
          </p>
        </div>

        <p className="text-sm text-slate-500">© 2026 FleetFlow. All rights reserved.</p>
      </section>

      <section className="flex flex-1 flex-col overflow-y-auto">
        <div className="px-5 pt-5 sm:px-8 sm:pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <FaArrowLeft size={12} />
            Back Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
          <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Outlet />
          </section>
        </div>
      </section>
    </div>
  );
}
