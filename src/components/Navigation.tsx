import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf } from 'lucide-react';
import { NAV_LINKS } from '@/lib/data';
import { scrollToId } from '@/hooks/useLenis';
import { cn } from '@/lib/utils';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(href), 50);
  };

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-[9000] transition-all duration-500',
          scrolled ? 'py-3' : 'py-5'
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500',
            scrolled && 'glass-strong rounded-full mx-4 md:mx-auto'
          )}
          style={scrolled ? { maxWidth: '72rem', padding: '0.6rem 1.5rem' } : undefined}
        >
          {/* Logo */}
          <button
            onClick={() => scrollToId('#hero')}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-ocean-700 glow-forest">
              <Leaf className="h-4.5 w-4.5 text-soft-white" strokeWidth={1.5} />
            </span>
            <span className="hidden font-display text-lg leading-none tracking-wide text-soft-white sm:block">
              Resilient Earth
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="group relative text-sm text-soft-white-dim transition-colors hover:text-soft-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA */}
          <button
            onClick={() => handleNav('#contact')}
            className="hidden rounded-full border border-forest-400/40 px-5 py-2 text-sm text-soft-white transition-all hover:border-accent-400/60 hover:bg-accent-500/10 lg:block"
          >
            Get in Touch
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-soft-white lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[8999] flex flex-col items-center justify-center gap-6 glass-strong lg:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleNav(link.href)}
                className="font-display text-3xl text-soft-white"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.06 }}
              onClick={() => handleNav('#contact')}
              className="mt-4 rounded-full border border-accent-400/60 px-8 py-3 text-soft-white"
            >
              Get in Touch
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
