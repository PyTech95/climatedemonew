import { motion } from 'framer-motion';

import { LinkedInIcon } from '@/components/SocialIcons';
import { SectionHeading } from '@/components/SectionHeading';
import { LEADERS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PHOTOS = [
  'https://images.pexels.com/photos/38197025/pexels-photo-38197025.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28446973/pexels-photo-28446973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10657877/pexels-photo-10657877.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37148340/pexels-photo-37148340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10657877/pexels-photo-10657877.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28446973/pexels-photo-28446973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function Leadership() {
  useScrollReveal();

  return (
    <section
      id="leadership"
      className="relative overflow-hidden py-32 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Leadership"
          title={
            <>
              <span className="reveal-mask">
                <span className="reveal-line">
                  The people behind
                </span>
              </span>{' '}
              <span className="reveal-mask">
                <span className="reveal-line text-gradient">
                  the mission.
                </span>
              </span>
            </>
          }
          data-reveal="lines"
        />

        <div className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {LEADERS.map((leader, i) => {
            const linkedinUrl = leader.linkedin?.trim();

            return (
              <motion.article
                key={leader.name}
                data-reveal="up"
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: '-10% 0px',
                }}
                whileHover={{
                  y: -8,
                }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  cursor-hover group relative overflow-hidden rounded-2xl
                  border border-accent-400/30
                  bg-forest-950/60 backdrop-blur-xl
                  shadow-[0_18px_45px_rgba(0,0,0,0.24)]
                  transition-all duration-500
                  hover:border-accent-400
                  hover:shadow-[0_0_30px_rgba(250,204,21,0.18),0_24px_60px_rgba(0,0,0,0.3)]
                "
              >
                {/* Image wrapper with border */}
                <div className="relative overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={PHOTOS[i] ?? PHOTOS[0]}
                      alt={leader.name}
                      loading="lazy"
                      className="
                        h-full w-full object-cover grayscale
                        transition-all duration-700
                        group-hover:scale-105
                        group-hover:grayscale-0
                      "
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" />

                    <div className="absolute inset-0 bg-forest-700/20 transition-opacity duration-500 group-hover:opacity-0" />

                    {/* LinkedIn button */}
                    {linkedinUrl ? (
                      <motion.a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${leader.name}'s LinkedIn profile`}
                        title={`${leader.name} on LinkedIn`}
                        onClick={(event) => event.stopPropagation()}
                        initial={{
                          opacity: 0,
                          y: 14,
                          scale: 0.9,
                        }}
                        whileHover={{
                          scale: 1.08,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        className="
                          absolute bottom-4 left-4 z-20
                          flex h-11 w-11 translate-y-4 items-center justify-center
                          rounded-full border border-accent-400/60
                          bg-forest-950/80 opacity-0 backdrop-blur-md
                          transition-all duration-500
                          group-hover:translate-y-0
                          group-hover:opacity-100
                          hover:border-accent-300
                          hover:bg-accent-400
                        "
                      >
                        <LinkedInIcon className="h-5 w-5 text-soft-white transition-colors duration-300 hover:text-forest-950" />
                      </motion.a>
                    ) : (
                      <div
                        className="
                          absolute bottom-4 left-4 z-20
                          flex h-11 w-11 translate-y-4 items-center justify-center
                          rounded-full border border-white/15
                          bg-forest-950/60 opacity-0 backdrop-blur-md
                          transition-all duration-500
                          group-hover:translate-y-0
                          group-hover:opacity-60
                        "
                        title="LinkedIn profile not available"
                      >
                        <LinkedInIcon className="h-5 w-5 text-soft-white/60" />
                      </div>
                    )}

                    {/* Decorative photo border glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 transition-all duration-500 group-hover:ring-accent-400/30" />
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 pb-6 pt-2">
                  <h3 className="font-display text-lg text-soft-white">
                    {leader.name}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-wider text-accent-300">
                    {leader.role}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-soft-white-dim/60">
                    {leader.bio}
                  </p>

                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        mt-5 inline-flex items-center gap-2
                        text-xs font-medium uppercase tracking-[0.14em]
                        text-accent-300 transition-colors duration-300
                        hover:text-accent-400
                      "
                    >
                      <LinkedInIcon className="h-4 w-4" />LinkedIn
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}