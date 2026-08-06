import { motion } from 'framer-motion';
import {
  Globe,
  TrendingUp,
  Users,
  Award,
  Scale,
  Leaf,
  Handshake,
  type LucideIcon,
} from 'lucide-react';

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

type ValueCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  index: number;
  featured?: boolean;
  className?: string;
};

function ValueCard({
  icon: Icon,
  title,
  description,
  index,
  featured = false,
  className,
}: ValueCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 32,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      whileHover={{
        y: -7,
        scale: featured ? 1.01 : 1.02,
      }}
      transition={{
        delay: index * 0.07,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        'group relative overflow-hidden border-2 border-accent-400',
        'bg-forest-950/82 backdrop-blur-xl',
        'shadow-[0_16px_45px_rgba(0,0,0,0.28)]',
        'transition-[box-shadow,background-color,border-color] duration-500',
        'hover:bg-forest-900/92',
        'hover:shadow-[0_0_28px_rgba(250,204,21,0.2),0_20px_55px_rgba(0,0,0,0.32)]',
        featured
          ? 'rounded-[28px] px-8 py-8 md:px-10 md:py-10'
          : 'rounded-[24px] px-6 py-7 md:px-7 md:py-8',
        className,
      )}
    >
      {/* Soft gold glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-400/10 via-transparent to-forest-700/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Shine sweep */}
      <motion.div
        initial={{
          x: '-180%',
          rotate: 18,
        }}
        whileInView={{
          x: '180%',
        }}
        viewport={{
          once: true,
        }}
        transition={{
          delay: 0.2 + index * 0.08,
          duration: 1.2,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -top-20 h-[340px] w-16 bg-white/10 blur-2xl"
      />

      {/* Corner glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 4.5 + index * 0.25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-400/10 blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        {/* Icon */}
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          whileHover={{
            rotate: 6,
            scale: 1.08,
          }}
          transition={{
            y: {
              duration: 3.2 + index * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: 0.25,
            },
            scale: {
              duration: 0.25,
            },
          }}
          className={cn(
            'flex items-center justify-center rounded-full',
            'border border-accent-400/80 bg-accent-400/10',
            'shadow-[0_0_20px_rgba(250,204,21,0.08)]',
            'transition-all duration-500',
            'group-hover:bg-accent-400/15',
            featured
              ? 'mb-5 h-16 w-16'
              : 'mb-4 h-12 w-12',
          )}
        >
          <Icon
            className={cn(
              'text-accent-400 transition-all duration-500 group-hover:scale-110',
              featured ? 'h-8 w-8' : 'h-6 w-6',
            )}
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Title */}
        <h3
          className={cn(
            'font-display font-medium leading-tight text-soft-white',
            featured
              ? 'text-2xl md:text-3xl'
              : 'text-xl md:text-2xl',
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={cn(
              'mt-4 font-light leading-[1.75] text-soft-white-dim',
              featured
                ? 'max-w-2xl text-sm md:text-base'
                : 'max-w-[320px] text-xs md:text-sm',
            )}
          >
            {description}
          </p>
        )}

        {/* Bottom accent line */}
        <span
          className={cn(
            'mt-6 h-[3px] rounded-full bg-accent-400',
            'transition-all duration-500 group-hover:w-20',
            featured ? 'w-12' : 'w-8',
          )}
        />
      </div>
    </motion.article>
  );
}

export function Values() {
  useScrollReveal();

  const valueItems = Array.isArray(VALUES) ? VALUES.slice(0, 7) : [];

  const featuredValue = valueItems[0];
  const secondaryValues = valueItems.slice(1);

  return (
    <section
      id="values"
      className="relative min-h-screen overflow-hidden bg-forest-950 py-20 md:py-24 lg:py-28"
    >
      {/* Animated background image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src="/images/wind-turbines.jpg"
          alt="Wind turbines representing renewable energy"
          initial={{
            scale: 1.06,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: [1.06, 1.11, 1.06],
            x: [0, -14, 0],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-forest-500 via-forest-900/30 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-forest-500 via-transparent to-forest-950/40" />

        <div className="absolute inset-0 bg-forest-950/42" />
      </div>

      {/* Background glows */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -18, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute left-[5%] top-[12%] h-64 w-64 rounded-full bg-accent-400/8 blur-[110px]"
      />

      <motion.div
        animate={{
          x: [0, -28, 0],
          y: [0, 16, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute bottom-[4%] right-[7%] h-80 w-80 rounded-full bg-forest-400/10 blur-[125px]"
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
        {/* Section heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: 26,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.35,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-accent-400" />

            <span className="text-xs font-medium uppercase tracking-[0.4em] text-accent-400">
              Our Values
            </span>
          </div>

          <h2 className="mt-7 font-display text-4xl font-light leading-[1.08] tracking-tight text-soft-white md:text-5xl lg:text-[62px]">
            What guides
            <span className="block text-accent-400">
              every decision.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base font-light leading-[1.8] text-soft-white-dim md:text-lg">
            Together, these values form the blueprint for how we operate as
            partners in your sustainability journey, always keeping our shared
            responsibility to the planet at the forefront.
          </p>
        </motion.div>

        {/* Values */}
        <div className="mt-12 md:mt-16">
          {featuredValue && (
            <ValueCard
              icon={ICONS[featuredValue.icon] ?? Globe}
              title={featuredValue.title}
              description={featuredValue.desc}
              index={0}
              featured
              className="min-h-[230px] md:min-h-[250px]"
            />
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {secondaryValues.map((value, index) => (
              <ValueCard
                key={value.title}
                icon={ICONS[value.icon] ?? Leaf}
                title={value.title}
                description={value.desc}
                index={index + 1}
                className="min-h-[210px] md:min-h-[225px]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}