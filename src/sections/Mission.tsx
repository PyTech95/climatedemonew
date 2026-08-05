import { motion } from 'framer-motion';
import { Particles } from '@/components/Particles';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Mission() {
  useScrollReveal();

  return (
    <section
      id="mission"
      className="relative flex min-h-screen items-center overflow-hidden gradient-ocean-forest py-32"
    >
      <Particles className="absolute inset-0 h-full w-full" count={40} color="rgba(107,176,209,0.5)" />

      {/* Organic blobs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[28rem] w-[28rem] rounded-full bg-forest-500/15 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-ocean-500/15 blur-3xl animate-blob" style={{ animationDelay: '-8s' }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          data-reveal="fade"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="h-px w-10 bg-accent-400/70" />
          <span className="text-xs uppercase tracking-[0.35em] text-accent-300">Our Mission</span>
          <span className="h-px w-10 bg-accent-400/70" />
        </motion.div>

        <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-light leading-[1] tracking-tight">
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block text-soft-white"
              initial={{ y: '110%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Creating a
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
              Better Tomorrow.
            </motion.span>
          </span>
        </h2>

        <motion.p
          data-reveal="up"
          className="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-soft-white-dim md:text-2xl"
        >
          To provide sustainability services to every household.
        </motion.p>

        <motion.p
          data-reveal="up"
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-soft-white-dim/60"
        >
          A future where sustainability is not a privilege of large corporations, but a standard
          accessible to every home, every community, every generation.
        </motion.p>
      </div>
    </section>
  );
}
