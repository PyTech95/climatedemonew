import { motion } from 'framer-motion';
import { LinkedInIcon } from '@/components/SocialIcons';
import { SectionHeading } from '@/components/SectionHeading';
import { LEADERS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PHOTOS = [
  'https://images.pexels.com/photos/28446973/pexels-photo-28446973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/38197025/pexels-photo-38197025.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10657877/pexels-photo-10657877.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37148340/pexels-photo-37148340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/36215318/pexels-photo-36215318.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function Leadership() {
  useScrollReveal();

  return (
    <section id="leadership" className="relative overflow-hidden py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Leadership"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">The people behind</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">the mission.</span></span>
            </>
          }
          data-reveal="lines"
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LEADERS.map((leader, i) => (
            <motion.article
              key={leader.name}
              data-reveal="up"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="cursor-hover group relative overflow-hidden rounded-2xl glass"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={PHOTOS[i]}
                  alt={leader.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" />
                <div className="absolute inset-0 bg-forest-700/20 transition-opacity duration-500 group-hover:opacity-0" />

                {/* Social on hover */}
                <div className="absolute bottom-4 left-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-white/10 backdrop-blur-md">
                    <LinkedInIcon className="h-4 w-4 text-soft-white" />
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-display text-lg text-soft-white">{leader.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-accent-300">{leader.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-soft-white-dim/60">{leader.bio}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-soft-white-dim/40">
          Profiles shown are representative placeholders. Actual team details to be provided.
        </p>
      </div>
    </section>
  );
}
