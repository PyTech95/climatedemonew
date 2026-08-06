import { useState, type FormEvent } from 'react';
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';

import {
  LinkedInIcon,
  TwitterIcon,
  InstagramIcon,
} from '@/components/SocialIcons';

import { NAV_LINKS, CONTACTF } from '@/lib/data';
import { scrollToId } from '@/hooks/useLenis';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubscribed(true);
    setEmail('');

    window.setTimeout(() => {
      setSubscribed(false);
    }, 3000);
  };

  const socialLinks = [
    {
      label: 'LinkedIn',
      href: CONTACTF.social.linkedin,
      icon: LinkedInIcon,
    },
    {
      label: 'Twitter',
      href: CONTACTF.social.twitter,
      icon: TwitterIcon,
    },
    {
      label: 'Instagram',
      href: CONTACTF.social.instagram,
      icon: InstagramIcon,
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-forest-700/40 bg-forest-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.35fr]">
          {/* Brand and newsletter */}
          <div>
            <button
              type="button"
              onClick={() => scrollToId('#hero')}
              className="flex items-center gap-2.5"
              aria-label="Go to homepage"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-ocean-700">
                <Leaf
                  className="h-4.5 w-4.5 text-soft-white"
                  strokeWidth={1.5}
                />
              </span>

              <span className="font-display text-lg text-soft-white">
                Resilient Earth
              </span>
            </button>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-soft-white-dim/60">
              Sustainability consulting for a built environment that gives
              back more than it takes.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-6">
              <p className="text-xs uppercase tracking-wider text-accent-300">
                Newsletter
              </p>

              <div className="mt-3 flex items-center gap-2 rounded-full border border-forest-600/50 bg-forest-900/40 p-1.5 pl-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email"
                  aria-label="Newsletter email"
                  className="min-w-0 flex-1 bg-transparent text-sm text-soft-white placeholder:text-soft-white-dim/30 focus:outline-none"
                />

                <button
                  type="submit"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 text-forest-950 transition-transform hover:scale-105"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {subscribed && (
                <p className="mt-2 text-xs text-forest-300">
                  Thank you for subscribing.
                </p>
              )}
            </form>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-300">
              Quick Links
            </p>

            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
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
            <p className="text-xs uppercase tracking-wider text-accent-300">
              Services
            </p>

            <ul className="mt-5 space-y-3 text-sm text-soft-white-dim/60">
              <li>Green Building Certification</li>
              <li>ESG &amp; Climate Strategy</li>
              <li>Energy &amp; Performance</li>
              <li>Audits &amp; Reporting</li>
            </ul>
          </div>

          {/* ContactF */}
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-300">
              Get in Touch
            </p>

            <ul className="mt-5 space-y-4 text-sm text-soft-white-dim/60">
              {/* Multiple emails */}
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />

                <div className="space-y-2">
                  {CONTACTF.emails.map((contactFEmail) => (
                    <a
                      key={contactFEmail}
                      href={`mailto:${contactFEmail}`}
                      className="block break-all transition-colors hover:text-soft-white"
                    >
                      {contactFEmail}
                    </a>
                  ))}
                </div>
              </li>

              

              {/* Corporate office */}
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />

                <div>
                  <p className="text-soft-white">
                    {CONTACTF.corporate.label}
                  </p>

                  <p className="mt-1 leading-relaxed">
                    {CONTACTF.corporate.address}
                  </p>
                </div>
              </li>
            </ul>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-600/40 text-soft-white-dim transition-all hover:border-accent-400/50 hover:bg-accent-500/10 hover:text-soft-white"
                  aria-label={label}
                  title={label}
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
            © {new Date().getFullYear()} Resilient Earth Solutions Pvt. Ltd.
            All rights reserved.
          </p>

          <p className="text-xs text-soft-white-dim/40">
            Building a Sustainable Future.
          </p>
        </div>
      </div>
    </footer>
  );
}