import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaBoxes } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10);
    });
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-white/60 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <FaBoxes className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              FleetFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="https://docs.fleetflow.io"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Documentation
            </a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/auth/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-4">
            <a
              href="https://docs.fleetflow.io"
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Documentation
            </a>
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/auth/login"
                className="text-center text-gray-700 hover:text-gray-900 font-medium py-2"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all"
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
