import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ eyebrow, title, className, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
        <span className="h-px w-10 bg-accent-400/70" />
        <span className="text-xs uppercase tracking-[0.35em] text-accent-300">{eyebrow}</span>
      </div>
      <h2
        className={cn(
          'mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] tracking-tight text-soft-white',
          align === 'center' && 'mx-auto'
        )}
      >
        {title}
      </h2>
    </div>
  );
}
