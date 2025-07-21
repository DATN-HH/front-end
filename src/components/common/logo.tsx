import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  type?: 'small' | 'large';
}

export function Logo({ className, type = 'large' }: LogoProps) {
  return (
    <div className={cn('flex items-center font-bold', className)}>
      <span
        className={cn('text-2xl', type === 'small' ? 'text-sm' : 'text-2xl')}
      >
        Menu
      </span>
      <span
        className={cn(
          'text-2xl text-primary',
          type === 'small' ? 'text-sm' : 'text-2xl'
        )}
      >
        +
      </span>
    </div>
  );
}
