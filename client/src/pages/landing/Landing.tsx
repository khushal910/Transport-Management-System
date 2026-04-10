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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 landing-radial-hero" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-80 landing-radial-bottom blur-3xl" />
      <ScrollAnimation3D />
      
      {/* Navigation */}
      <Navbar />
      {authMessage && (
        <div className="fixed left-1/2 top-24 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/95 p-4 text-sm text-rose-900 shadow-md backdrop-blur-sm">
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
