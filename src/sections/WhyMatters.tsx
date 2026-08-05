import { motion } from 'framer-motion';
import { Particles } from '@/components/Particles';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const WHY_IMAGES = [
  'https://images.pexels.com/photos/165537/pexels-photo-165537.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/38260470/pexels-photo-38260470.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const PILLARS = [
  { title: 'Healthier Communities', desc: 'Better air quality, daylight, and thermal comfort improve the lives of everyone who enters a building.' },
  { title: 'Lower Environmental Impact', desc: 'Every kilowatt saved and every drop conserved reduces the burden on our shared ecosystems.' },
  { title: 'Long-term Value', desc: 'Sustainable assets cost less to operate, command higher value, and stay relevant for decades.' },
];

export function WhyMatters() {
  useScrollReveal();

  return (
    <section className="relative overflow-hidden py-32 md:py-40">
      <Particles className="absolute inset-0 h-full w-full opacity-50" count={35} />

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-accent-400/70" />
            <span className="text-xs uppercase tracking-[0.35em] text-accent-300">Why It Matters</span>
          </div>
          <h2 className="mt-5 font-display text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.05] tracking-tight text-soft-white">
            <span className="reveal-mask"><span className="reveal-line">Buildings shape the</span></span>{' '}
            <span className="reveal-mask"><span className="reveal-line text-gradient">world we share.</span></span>
          </h2>
        </div>

        {/* Image + narrative */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            data-reveal="clip"
            className="relative aspect-[5/6] overflow-hidden rounded-3xl"
          >
            <img
              src={WHY_IMAGES[0]}
              alt="Sunlight through a green forest"
              loading="lazy"
              data-clip-inner
              data-parallax="0.15"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 to-transparent" />
          </motion.div>

          <div className="space-y-10">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                data-reveal="up"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.12, duration: 0.8 }}
                className="border-l border-forest-600/50 pl-6"
              >
                <h3 className="font-display text-2xl text-soft-white">{p.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-soft-white-dim/70">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Full-width emotional banner */}
        <motion.div
          data-reveal="clip"
          className="relative mt-20 h-80 overflow-hidden rounded-3xl"
        >
          <img
            src={WHY_IMAGES[1]}
            alt="Mountain village surrounded by green hills"
            loading="lazy"
            data-clip-inner
            data-parallax="0.2"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-950/50" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-3xl font-display text-2xl font-light leading-snug text-soft-white md:text-4xl">
              "The most sustainable building is the one that gives back more than it takes —
              to its people, its place, and the planet."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
