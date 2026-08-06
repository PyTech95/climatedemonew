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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
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
  href={`mailto:${CONTACT.emails[0]}`}
  className="group flex items-start gap-3 rounded-2xl glass p-6 transition-all hover:border-accent-400/30"
>
  <Mail
    className="mt-1 h-5 w-5 text-accent-400"
    strokeWidth={1.5}
  />

  <div>
    <p className="text-xs uppercase tracking-wider text-accent-300">
      Email
    </p>

    <div className="mt-2 space-y-2">
      {CONTACT.emails.map((email) => (
        <a
          key={email}
          href={`mailto:${email}`}
          className="block text-sm text-soft-white-dim transition-colors hover:text-accent-300"
        >
          {email}
        </a>
      ))}
    </div>
  </div>
</a><div className="group flex items-start gap-3 rounded-2xl glass p-6 transition-all hover:border-accent-400/30">
  <Phone
    className="mt-1 h-5 w-5 text-accent-400"
    strokeWidth={1.5}
  />

  <div>
    <p className="text-xs uppercase tracking-wider text-accent-300">
      Phone
    </p>

    <div className="mt-2 space-y-2">
      {CONTACT.phones.map((phone) => (
        <a
          key={phone}
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="block text-sm text-soft-white-dim transition-colors hover:text-accent-300"
        >
          {phone}
        </a>
      ))}
    </div>
  </div>
</div>
            </div>

            {/* Map */}
          <div className="relative h-64 overflow-hidden rounded-2xl glass">
  <iframe
    title="Office location map"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.648842297989!2d77.55959901115324!3d28.460000191793444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cbff7e3f95593%3A0xae2c06dc0dba04ea!2sEldeco%20Mystic%20Greens%20Greater%20Noida!5e0!3m2!1sen!2sin!4v1785990560286!5m2!1sen!2sin"
    width="100%"
    height="100%"
    loading="lazy"
    allowFullScreen
    referrerPolicy="strict-origin-when-cross-origin"
   className="h-full w-full border-0"
  />

  {/* Overlay */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/40 via-transparent to-transparent" />

  {/* Location Badge */}
  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-accent-400/30 bg-forest-950/80 px-4 py-2 backdrop-blur-md">
    <MapPin
      className="h-4 w-4 text-accent-400"
      strokeWidth={1.8}
    />

    <span className="text-sm text-soft-white">
      Greater Noida, Uttar Pradesh
    </span>
  </div>
</div>
          </div>
        </div>
      </div>
    </section>
  );
}
