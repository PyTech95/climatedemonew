import { motion } from 'framer-motion';
import { Particles } from '@/components/Particles';
import { Sprout } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Community() {
  useScrollReveal();

  return (
    <section
      id="community"
      className="relative flex min-h-screen items-center overflow-hidden gradient-forest py-32"
    >
      <Particles className="absolute inset-0 h-full w-full" count={45} />

      {/* Organic blobs */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[26rem] w-[26rem] rounded-full bg-forest-500/15 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl animate-blob" style={{ animationDelay: '-7s' }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          data-reveal="fade"
          className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-forest-400/30 bg-forest-800/40 glow-forest"
        >
          <Sprout className="h-8 w-8 text-forest-200" strokeWidth={1.5} />
        </motion.div>

        <p className="text-xs uppercase tracking-[0.4em] text-accent-300">Community</p>

        <h2 className="mt-8 font-display text-[clamp(2.2rem,6vw,5.5rem)] font-light leading-[1.05] tracking-tight">
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block text-soft-white"
              initial={{ y: '110%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              "As we want to build
            </motion.span>
          </span>
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block text-gradient"
              initial={{ y: '110%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              something really beautiful
            </motion.span>
          </span>
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block text-soft-white"
              initial={{ y: '110%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              and meaningful for the community."
            </motion.span>
          </span>
        </h2>

        <motion.p
          data-reveal="up"
          className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-soft-white-dim/70"
        >
          Sustainability is not a technical exercise. It is a commitment to the people who live,
          work, and grow within the spaces we shape — and to the generations who will inherit them.
          We design for community, for wellbeing, and for a future worth building.
        </motion.p>

        <motion.div
          data-reveal="up"
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="rounded-full border border-forest-400/30 px-6 py-3 text-sm text-soft-white-dim">
            Environmental Responsibility
          </div>
          <div className="rounded-full border border-forest-400/30 px-6 py-3 text-sm text-soft-white-dim">
            Community Wellbeing
          </div>
          <div className="rounded-full border border-forest-400/30 px-6 py-3 text-sm text-soft-white-dim">
            Generational Impact
          </div>
        </motion.div>
      </div>
    </section>
  );
}
