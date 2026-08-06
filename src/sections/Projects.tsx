import { motion } from 'framer-motion';
import { MapPin, Award, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { PROJECTS } from '@/lib/data';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PROJECT_IMAGES = [
  'https://images.pexels.com/photos/13111771/pexels-photo-13111771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28567004/pexels-photo-28567004.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4610157/pexels-photo-4610157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32649853/pexels-photo-32649853.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/8232033/pexels-photo-8232033.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/35388120/pexels-photo-35388120.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37849773/pexels-photo-37849773.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37731378/pexels-photo-37731378.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37731380/pexels-photo-37731380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13005382/pexels-photo-13005382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28567004/pexels-photo-28567004.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13111771/pexels-photo-13111771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function Projects() {
  useScrollReveal();

  return (
    <section id="projects" className="relative overflow-hidden py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Projects delivered"
          title={
            <>
              <span className="reveal-mask"><span className="reveal-line">Trusted by leaders</span></span>{' '}
              <span className="reveal-mask"><span className="reveal-line text-gradient">in sustainable design.</span></span>
            </>
          }
          data-reveal="lines"
        />

        <p data-reveal="up" className="mt-6 max-w-2xl text-lg text-soft-white-dim">
          A selection of organizations we've partnered with on green building certification,
          energy performance, and climate strategy. Project specifics are represented as
          placeholders pending client approval.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="cursor-hover group relative overflow-hidden rounded-2xl glass"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden" data-reveal="clip">
                <img
                  src={PROJECT_IMAGES[i]}
                  alt={`${project.name} — ${project.location}`}
                  loading="lazy"
                  data-clip-inner
                  className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/20 to-transparent" />
                <div className="absolute inset-0 bg-forest-800/30 transition-opacity duration-500 group-hover:opacity-0" />

                {/* Cert badge */}
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-forest-950/60 px-3 py-1.5 backdrop-blur-md">
                  <Award className="h-3.5 w-3.5 text-accent-400" />
                  <span className="text-xs text-soft-white">{project.cert}</span>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-soft-white/10 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 text-soft-white" />
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-display text-xl text-soft-white">{project.name}</h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-soft-white-dim/60">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-soft-white-dim/60">
                  {project.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
