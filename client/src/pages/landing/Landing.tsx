import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Footer from './Footer';
import ScrollAnimation3D from '../../components/ScrollAnimation3D';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* 3D Scroll Animation Background */}
      <ScrollAnimation3D />
      
      {/* Navigation */}
      <Navbar />

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
