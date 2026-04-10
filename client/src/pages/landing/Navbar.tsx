import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaBoxes } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm'
          : 'bg-white/35 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-2">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/30">
              <FaBoxes className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              FleetFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/docs"
              className="text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
            >
              Documentation
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth/login"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-700 transition-colors hover:text-blue-700 md:hidden"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md md:hidden">
            <Link
              to="/docs"
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700"
            >
              Documentation
            </Link>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
              <Link
                to="/auth/login"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
