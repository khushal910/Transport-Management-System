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
          ? 'border-b border-slate-700/50 bg-slate-950/90 backdrop-blur-xl shadow-[0_25px_60px_-30px_rgba(15,23,42,0.5)]'
          : 'bg-slate-950/30 backdrop-blur-xl'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer transition-opacity duration-200 hover:opacity-90">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
              <FaBoxes className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-cyan-300 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              FleetFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/docs"
              className="text-sm font-semibold text-slate-100 transition-colors hover:text-cyan-300"
            >
              Documentation
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth/login"
              className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-cyan-300 hover:text-cyan-300"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="rounded-full bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
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
          <div className="rounded-2xl border border-blue-200/60 bg-white/95 p-4 shadow-md backdrop-blur-sm md:hidden">
            <Link
              to="/docs"
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              Documentation
            </Link>
            <div className="mt-4 flex flex-col gap-3 border-t border-blue-100 pt-4">
              <Link
                to="/auth/login"
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
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
