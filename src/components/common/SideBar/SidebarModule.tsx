import { SidebarLink } from './SidebarLink';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarModuleProps {
  module: {
    id: string;
    icon: React.ReactNode;
    label: string;
    items: {
      href: string;
      icon: React.ReactNode;
      label: string;
    }[];
    activePaths: string[];
  };
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}

export function SidebarModule({ module, isOpen, onToggle, pathname }: SidebarModuleProps) {
  const isActive = module.activePaths.some(path => pathname.includes(path));
  
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
          isActive && 'bg-orange-50 text-orange-500'
        )}
      >
        <div className="flex items-center gap-2">
          {module.icon}
          <span>{module.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {module.items.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname.includes(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
}