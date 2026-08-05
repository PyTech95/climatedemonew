import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Particles } from '@/components/Particles';
import { scrollToId } from '@/hooks/useLenis';

const EarthScene = lazy(() =>
  import('@/components/EarthScene').then((m) => ({ default: m.EarthScene }))
);

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden gradient-forest">
      {/* 3D Earth */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full gradient-ocean-forest" />}>
          <EarthScene className="h-full w-full opacity-90" />
        </Suspense>
        {/* Vignette so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-900/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-forest-950/40" />
      </div>

      {/* Floating particles */}
      <Particles className="absolute inset-0 z-[1] h-full w-full" count={50} />

      {/* Organic blobs */}
      <div className="pointer-events-none absolute -left-40 top-1/3 z-[1] h-96 w-96 rounded-full bg-forest-500/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -right-32 bottom-10 z-[1] h-80 w-80 rounded-full bg-ocean-600/20 blur-3xl animate-blob" style={{ animationDelay: '-6s' }} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-12 bg-accent-400" />
          <span className="text-xs uppercase tracking-[0.35em] text-accent-300">
            Sustainability Consulting
          </span>
        </motion.div>

        {/* Headline with line reveal */}
        <h1 className="font-display text-[clamp(2.8rem,8vw,7.5rem)] font-light leading-[0.95] tracking-tight text-soft-white">
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Building a
            </motion.span>
          </span>
          <span className="reveal-mask block">
            <motion.span
              className="reveal-line block text-gradient"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ delay: 0.65, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Sustainable Future.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-soft-white-dim"
        >
          Delivering sustainability consulting, green building certifications, ESG strategy,
          climate action planning, and environmental excellence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={() => scrollToId('#services')}
            className="group flex items-center gap-2 rounded-full bg-soft-white px-7 py-3.5 text-sm font-medium text-forest-950 transition-all hover:bg-accent-400 hover:shadow-[0_0_30px_-5px_rgba(201,169,106,0.6)]"
          >
            Explore Our Services
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            onClick={() => scrollToId('#about')}
            className="rounded-full border border-forest-300/30 px-7 py-3.5 text-sm text-soft-white transition-all hover:border-forest-300/70 hover:bg-forest-800/40"
          >
            Our Story
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-soft-white-dim/60">Scroll</span>
        <div className="relative h-10 w-px overflow-hidden bg-forest-600">
          <div className="absolute left-0 top-0 h-4 w-px bg-accent-400 animate-scroll-hint" />
        </div>
        <ArrowDown className="h-3 w-3 text-accent-400/60" />
      </motion.div>
    </section>
  );
}
