import { useState } from 'react';
import { Leaf, Mail, ArrowRight } from 'lucide-react';
import { LinkedInIcon, TwitterIcon, InstagramIcon } from '@/components/SocialIcons';
import { NAV_LINKS, CONTACT } from '@/lib/data';
import { scrollToId } from '@/hooks/useLenis';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative overflow-hidden border-t border-forest-700/40 bg-forest-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand + newsletter */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-ocean-700">
                <Leaf className="h-4.5 w-4.5 text-soft-white" strokeWidth={1.5} />
              </span>
              <span className="font-display text-lg text-soft-white">Resilient Earth</span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-soft-white-dim/60">
              Sustainability consulting for a built environment that gives back more than it takes.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-6">
              <p className="text-xs uppercase tracking-wider text-accent-300">Newsletter</p>
              <div className="mt-3 flex items-center gap-2 rounded-full border border-forest-600/50 bg-forest-900/40 p-1.5 pl-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 bg-transparent text-sm text-soft-white placeholder:text-soft-white-dim/30 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-forest-950 transition-transform hover:scale-105"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 text-xs text-forest-300">Thank you for subscribing.</p>
              )}
            </form>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-300">Quick Links</p>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToId(link.href)}
                    className="text-sm text-soft-white-dim/60 transition-colors hover:text-soft-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-300">Services</p>
            <ul className="mt-5 space-y-3 text-sm text-soft-white-dim/60">
              <li>Green Building Certification</li>
              <li>ESG & Climate Strategy</li>
              <li>Energy & Performance</li>
              <li>Audits & Reporting</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-300">Get in Touch</p>
            <ul className="mt-5 space-y-3 text-sm text-soft-white-dim/60">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-soft-white">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 text-accent-400">@</span>
                <span>{CONTACT.corporate.label}</span>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {[LinkedInIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-600/40 text-soft-white-dim transition-all hover:border-accent-400/50 hover:bg-accent-500/10 hover:text-soft-white"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-forest-800/60 pt-8 md:flex-row">
          <p className="text-xs text-soft-white-dim/40">
            © {new Date().getFullYear()} Resilient Earth Solutions Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-soft-white-dim/40">
            Building a Sustainable Future.
          </p>
        </div>
      </div>
    </footer>
  );
}
