import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center font-bold', className)}>
      <span className="text-2xl">Menu</span>
      <span className="text-2xl text-primary">+</span>
    </div>
  );
}
