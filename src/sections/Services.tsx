import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { SERVICES } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const CAT_COLORS: Record<string, string> = {
  Performance: 'from-forest-500/20 to-ocean-700/20',
  Audit: 'from-earth-600/20 to-forest-600/20',
  Certification: 'from-accent-500/15 to-forest-500/20',
  Strategy: 'from-ocean-600/20 to-forest-600/20',
  Reporting: 'from-forest-600/20 to-ocean-800/20',
};

export function Services() {
  useScrollReveal();

  return (
    <section id="services" className="relative overflow-hidden py-32 md:py-40">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-forest-600/15 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-96 w-96 rounded-full bg-ocean-700/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Sustainability Services"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">A complete suite for</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">sustainable performance.</span></span>
            </>
          }
          data-reveal="lines"
        />

        <p data-reveal="up" className="mt-6 max-w-2xl text-lg text-soft-white-dim">
          Eighteen specialized services spanning performance verification, audits, certifications,
          strategy, and reporting — engineered to carry your project from aspiration to outcome.
        </p>

        {/* Service cards grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVICES.map((service, i) => (
            <motion.article
              key={service.title}
              data-reveal="up"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ delay: (i % 4) * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="cursor-hover group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-500 hover:border-accent-400/30"
            >
              {/* Gradient glow on hover */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                CAT_COLORS[service.cat]
              )} />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent-300/70">
                    {service.cat}
                  </span>
                  <span className="font-display text-xs text-soft-white-dim/30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg leading-snug text-soft-white">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-soft-white-dim/60">
                  {service.desc}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-soft-white-dim/40 transition-all duration-300 group-hover:text-accent-300">
                  Learn more
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
