import { SectionHeading } from '@/components/SectionHeading';
import { COLLABORATIONS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Collaborations() {
  useScrollReveal();

  const row = [...COLLABORATIONS, ...COLLABORATIONS];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Industry Collaborations"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">Partnering across</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">the industry.</span></span>
            </>
          }
          data-reveal="lines"
          align="center"
        />
      </div>

      {/* Marquee walls */}
      <div className="relative mt-16 flex flex-col gap-8">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-forest-900 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-forest-900 to-transparent" />

        <div className="flex w-max marquee-track animate-marquee">
          {row.map((name, i) => (
            <div
              key={`a-${i}`}
              className="mx-8 flex items-center gap-3 whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400/50" />
              <span className="font-display text-2xl text-soft-white-dim/40 transition-colors hover:text-soft-white md:text-3xl">
                {name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex w-max marquee-track animate-marquee-rev">
          {row.map((name, i) => (
            <div
              key={`b-${i}`}
              className="mx-8 flex items-center gap-3 whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-forest-300/40" />
              <span className="font-display text-2xl text-soft-white-dim/30 transition-colors hover:text-soft-white md:text-3xl">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
