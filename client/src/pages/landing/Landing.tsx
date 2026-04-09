import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Footer from './Footer';
import ScrollAnimation3D from '../../components/ScrollAnimation3D';

export default function Landing() {
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedMessage = localStorage.getItem('authRedirectMessage');
    if (storedMessage) {
      setAuthMessage(storedMessage);
      localStorage.removeItem('authRedirectMessage');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* 3D Scroll Animation Background */}
      <ScrollAnimation3D />
      
      {/* Navigation */}
      <Navbar />
      {authMessage && (
        <div className="fixed top-20 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-sm">
            <p className="font-semibold">Account access revoked</p>
            <p>{authMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
