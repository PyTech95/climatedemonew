import { motion } from 'framer-motion';
import { Lightbulb, PenTool, Hammer, Home, Activity } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { LIFECYCLE_STEPS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ICONS = { lightbulb: Lightbulb, 'pen-tool': PenTool, hammer: Hammer, home: Home, activity: Activity };

export function About() {
  useScrollReveal();

  return (
    <section id="about" className="relative overflow-hidden py-32 md:py-40">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-ocean-700/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="About Us"
          title={
            <>
              <span className="reveal-mask">
                <span className="reveal-line">End-to-end sustainability,</span>
              </span>{' '}
              <span className="reveal-mask">
                <span className="reveal-line text-gradient">across every stage.</span>
              </span>
            </>
          }
          data-reveal="lines"
        />

        <div className="mt-12 grid gap-16 lg:grid-cols-[1.1fr_1fr]">
          {/* Narrative */}
          <div data-reveal="up" className="space-y-6 text-lg leading-relaxed text-soft-white-dim">
            <p>
              <span className="text-soft-white">Resilient Earth Solutions</span> We provide end-to-end guidance throughout the building lifecycle—from 
initial concept and design development through construction, 
occupancy, and ongoing operations.
            </p>
            <p>
               Our consultants are accredited 
across all major green building certification frameworks including 
USGBC LEED, IGBC, GRIHA, EDGE and WiredScore allowing us to tailor 
our approach to your specific regional requirements, organizational 
goals, and budget parameters.
            </p>
            <p>
              We transform sustainability challenges 
into opportunities for innovation, differentiation, and long-term value 
creation.
            </p>
          </div>

          {/* Stats */}
          <div data-reveal="up" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl glass">
            {[
              { v: 'Lifecycle', l: 'Full coverage' },
              { v: '5', l: 'Lifecycle stages' },
              { v: '18', l: 'Service offerings' },
              { v: '6', l: 'Rating systems' },
            ].map((s) => (
              <div key={s.l} className="bg-forest-900/40 p-8">
                <p className="font-display text-3xl font-light text-soft-white">{s.v}</p>
                <p className="mt-2 text-sm text-soft-white-dim/70">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle timeline */}
        <div className="mt-24">
          <p className="mb-10 text-sm uppercase tracking-[0.3em] text-accent-300">
            The Building Lifecycle
          </p>
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-forest-600 via-forest-400 to-accent-400/40 md:block" />

            <div className="grid gap-12 md:grid-cols-5 md:gap-6">
              {LIFECYCLE_STEPS.map((step, i) => {
                const Icon = ICONS[step.icon as keyof typeof ICONS];
                return (
                  <motion.div
                    key={step.phase}
                    data-reveal="up"
                    className="relative"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ delay: i * 0.12, duration: 0.8 }}
                  >
                    {/* Node */}
                    <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-forest-400/40 bg-forest-900 glow-forest">
                      <Icon className="h-5 w-5 text-forest-200" strokeWidth={1.5} />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] text-forest-950">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-soft-white">{step.phase}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-soft-white-dim/70">
                      {step.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
