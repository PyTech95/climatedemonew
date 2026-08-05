import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building2, Home } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { CONTACT } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Contact() {
  useScrollReveal();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', message: '' });
    }, 3500);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-32 md:py-40">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-ocean-700/15 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-96 w-96 rounded-full bg-forest-500/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">Let's build something</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">sustainable together.</span></span>
            </>
          }
          data-reveal="lines"
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            data-reveal="up"
            className="rounded-3xl glass-strong p-8 md:p-10"
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm text-soft-white-dim">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-forest-400/20 bg-forest-900/40 px-4 py-3.5 text-soft-white placeholder:text-soft-white-dim/30 transition-all focus:border-accent-400/50 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-soft-white-dim">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-forest-400/20 bg-forest-900/40 px-4 py-3.5 text-soft-white placeholder:text-soft-white-dim/30 transition-all focus:border-accent-400/50 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-soft-white-dim">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full resize-none rounded-xl border border-forest-400/20 bg-forest-900/40 px-4 py-3.5 text-soft-white placeholder:text-soft-white-dim/30 transition-all focus:border-accent-400/50 focus:outline-none focus:ring-1 focus:ring-accent-400/30"
                  placeholder="Tell us about your project or sustainability goals..."
                />
              </div>
              <button
                type="submit"
                disabled={submitted}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-soft-white px-6 py-4 text-sm font-medium text-forest-950 transition-all hover:bg-accent-400 disabled:opacity-70"
              >
                {submitted ? 'Message Sent' : 'Send Message'}
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.form>

          {/* Info + Map */}
          <div data-reveal="up" className="space-y-6">
            {/* Contact details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl glass p-6">
                <Building2 className="mb-3 h-5 w-5 text-accent-400" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-wider text-accent-300">{CONTACT.corporate.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-soft-white-dim/70">
                  {CONTACT.corporate.address}
                </p>
              </div>
              <div className="rounded-2xl glass p-6">
                <Home className="mb-3 h-5 w-5 text-accent-400" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-wider text-accent-300">{CONTACT.registered.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-soft-white-dim/70">
                  {CONTACT.registered.address}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${CONTACT.email}`}
                className="group flex items-center gap-3 rounded-2xl glass p-6 transition-all hover:border-accent-400/30"
              >
                <Mail className="h-5 w-5 text-accent-400" strokeWidth={1.5} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-accent-300">Email</p>
                  <p className="mt-1 text-sm text-soft-white-dim">{CONTACT.email}</p>
                </div>
              </a>
              <a
                href={`tel:${CONTACT.phone}`}
                className="group flex items-center gap-3 rounded-2xl glass p-6 transition-all hover:border-accent-400/30"
              >
                <Phone className="h-5 w-5 text-accent-400" strokeWidth={1.5} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-accent-300">Phone</p>
                  <p className="mt-1 text-sm text-soft-white-dim">{CONTACT.phone}</p>
                </div>
              </a>
            </div>

            {/* Map */}
            <div className="relative h-64 overflow-hidden rounded-2xl glass">
              <iframe
                title="Office location map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.3%2C12.9%2C77.7%2C13.1&layer=mapnik&marker=12.9716%2C77.5946"
                className="h-full w-full grayscale invert-[0.9] sepia-[0.2] opacity-70"
                loading="lazy"
                style={{ border: 0 }}
              />
              <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-forest-950/70 px-3 py-1.5 backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-accent-400" />
                <span className="text-xs text-soft-white">Bengaluru, India — indicative</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
