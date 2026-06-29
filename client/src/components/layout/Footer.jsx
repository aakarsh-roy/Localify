import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowUpRight, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center space-x-2.5 mb-6">
              <img src="/images/logo.png" alt="Localify Logo" className="h-24 w-auto" />
            </div>
            <p className="text-neutral-500 mb-6 max-w-sm leading-relaxed text-sm">
              Find and book trusted local service providers for all your home service needs. 
              We connect you with verified professionals in your area.
            </p>
            <div className="flex space-x-3">
              {[
                { href: 'https://facebook.com', label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { href: 'https://twitter.com', label: 'Twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                { href: 'https://github.com', label: 'GitHub', path: 'M12 0C5.374 0 0 5.374 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .32.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-500 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all duration-300"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-[13px] font-bold text-neutral-950 uppercase tracking-wider mb-6">Quick Links</h3>
            <ul className="space-y-3.5">
              {[
                { to: '/search', label: 'Find Services' },
                { to: '/register?role=provider', label: 'Become a Provider' },
                { to: '/#how-it-works', label: 'How it Works' },
                { to: '/search', label: 'Browse Categories' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-950 transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="text-[13px] font-bold text-neutral-950 uppercase tracking-wider mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-neutral-700" />
                </div>
                <span className="text-sm font-medium text-neutral-600">support@localify.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-neutral-700" />
                </div>
                <span className="text-sm font-medium text-neutral-600">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-700" />
                </div>
                <span className="text-sm font-medium text-neutral-600 leading-relaxed">123 Service Street<br />Mumbai, MH 400101</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-neutral-500">
              &copy; {new Date().getFullYear()} Localify. All rights reserved.
            </p>
            <p className="text-[13px] font-medium text-neutral-500 flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 text-neutral-950 fill-neutral-950" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
