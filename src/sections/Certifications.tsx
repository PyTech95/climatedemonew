import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { CERTIFICATIONS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Certifications() {
  useScrollReveal();

  return (
    <section id="certifications" className="relative overflow-hidden py-32 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Our Credentials"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">Ratings we deliver</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">with authority.</span></span>
            </>
          }
          data-reveal="lines"
          align="center"
        />

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div
              key={cert.name}
              data-reveal="up"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="cursor-hover group relative overflow-hidden rounded-2xl glass-strong p-8 text-center transition-all duration-500 hover:glow-accent"
            >
              {/* Glow ring */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 60px -20px rgba(201,169,106,0.5)' }} />
              </div>

              <div className="relative z-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent-400/30 bg-accent-500/5 transition-all duration-500 group-hover:border-accent-400/70 group-hover:bg-accent-500/15">
                  <BadgeCheck className="h-7 w-7 text-accent-400 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl text-soft-white">{cert.name}</h3>
<p
  className="
    mt-6
    mx-auto
    max-w-[320px]
    text-justify
    text-[15px]
    leading-7
    font-light
    tracking-[0.01em]
    text-soft-white-dim/80
    transition-all duration-500
    group-hover:text-soft-white
  "
>
  {cert.full}
</p>              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
