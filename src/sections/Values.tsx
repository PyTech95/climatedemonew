import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Award, Scale, Leaf, Handshake, type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { VALUES } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  'trending-up': TrendingUp,
  users: Users,
  award: Award,
  scale: Scale,
  leaf: Leaf,
  handshake: Handshake,
};

export function Values() {
  useScrollReveal();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="values" className="relative overflow-hidden py-32 md:py-40">
      <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent-500/8 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Our Values"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">What guides</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">every decision.</span></span>
            </>
          }
          data-reveal="lines"
          align="center"
        />

        {/* Honeycomb grid */}
        <div className="mt-20 flex flex-wrap justify-center gap-4 md:gap-6">
          {VALUES.map((value, i) => {
            const Icon = ICONS[value.icon];
            const isActive = active === i;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="cursor-hover group relative"
                style={{
                  // Offset alternating columns for honeycomb effect
                  marginTop: i % 2 === 1 ? '3rem' : '0',
                }}
              >
                <div
                  className={cn(
                    'hex-clip flex h-44 w-48 flex-col items-center justify-center p-6 text-center transition-all duration-500 md:h-52 md:w-56',
                    isActive
                      ? 'bg-gradient-to-br from-forest-500 to-ocean-700 glow-forest'
                      : 'glass'
                  )}
                >
                  <Icon
                    className={cn(
                      'mb-3 h-7 w-7 transition-all duration-500',
                      isActive ? 'text-accent-300 scale-110' : 'text-forest-300'
                    )}
                    strokeWidth={1.5}
                  />
                  <h3 className={cn(
                    'font-display text-sm leading-tight transition-colors duration-500 md:text-base',
                    isActive ? 'text-soft-white' : 'text-soft-white-dim'
                  )}>
                    {value.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 overflow-hidden text-xs leading-relaxed text-soft-white-dim/60 transition-all duration-500',
                      isActive ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
