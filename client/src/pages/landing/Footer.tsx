import { Link } from 'react-router-dom';
import { FaBoxes, FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '/security' },
    { label: 'Status', href: 'https://status.fleetflow.io' }
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' }
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Support', href: '/support' },
    { label: 'Community', href: '/community' }
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' }
  ]
};

const socialLinks = [
  { icon: FaFacebook, href: 'https://facebook.com/fleetflow', label: 'Facebook' },
  { icon: FaTwitter, href: 'https://twitter.com/fleetflow', label: 'Twitter' },
  { icon: FaLinkedin, href: 'https://linkedin.com/company/fleetflow', label: 'LinkedIn' },
  { icon: FaGithub, href: 'https://github.com/fleetflow', label: 'GitHub' }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-200 bg-slate-950 pt-20 pb-8 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
                <FaBoxes className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">FleetFlow</span>
            </div>
            <p className="mb-6 text-sm text-slate-400">
              Simplify fleet operations and maximize efficiency with real-time tracking and analytics.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
                    aria-label={social.label}
                  >
                    <Icon className="text-lg group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.08em] text-white">Product</h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-blue-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.08em] text-white">Company</h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-blue-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.08em] text-white">Resources</h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-blue-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.08em] text-white">Newsletter</h3>
            <p className="mb-4 text-sm text-slate-400">
              Subscribe to our newsletter for updates and fleet management tips.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-l-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition-colors focus:border-blue-500 focus:outline-none"
              />
              <button className="rounded-r-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:from-blue-500 hover:to-indigo-500">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-800"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-400">
            &copy; {currentYear} FleetFlow. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 transition-colors duration-200 hover:text-blue-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p className="text-sm text-slate-400">
            All systems operational{' '}
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
          </p>
        </div>
      </div>
    </footer>
  );
}
