'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Logo } from '@/components/common/logo';
import { ProtectedElement } from '@/components/protected-component';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SIDEBAR_CONFIG } from '@/config/sidebar-config';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface SectionSidebarProps {
  className?: string;
}

export function SectionSidebar({ className }: SectionSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  const toggleModule = (moduleId: string) => {
    setOpenModule((current) => (current === moduleId ? null : moduleId));
  };

  // Determine if sidebar should show expanded content
  // On mobile (lg and below), always show expanded content
  const shouldShowContent = !isCollapsed || isHovered;

  return (
    <aside
      className={cn(
        'group flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out',
        // On mobile, always show full width. On desktop, use collapsed/expanded behavior
        'w-[240px] lg:relative',
        'lg:w-auto',
        isCollapsed ? 'lg:w-[70px] lg:hover:w-[240px]' : 'lg:w-[240px]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center transition-all duration-300',
          isCollapsed && !isHovered ? 'lg:px-3' : 'justify-between px-4'
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo
            className="h-8 w-8"
            type={isCollapsed && !isHovered ? 'small' : 'large'}
          />
        </Link>
        {/* Toggle button - always show when expanded or when hovered, hide on mobile */}
        {shouldShowContent && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 flex-shrink-0 transition-all duration-300"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-2 py-2">
          {/* Render standalone links from config */}
          {SIDEBAR_CONFIG.standaloneLinks.map((link) => (
            <ProtectedElement key={link.href} requiredRoles={link.roles}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg py-2 text-sm transition-all duration-300',
                  isCollapsed && !isHovered
                    ? 'lg:justify-center lg:px-2'
                    : 'px-3',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.icon}
                <span
                  className={cn(
                    'transition-all duration-300',
                    !shouldShowContent &&
                      'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                  )}
                >
                  {link.label}
                </span>
              </Link>
            </ProtectedElement>
          ))}

          {/* Render modules from config */}
          {SIDEBAR_CONFIG.modules.map((module) => (
            <ProtectedElement key={module.id} requiredRoles={module.roles}>
              <div className="space-y-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg py-2 text-sm transition-all duration-300',
                    isCollapsed && !isHovered
                      ? 'lg:justify-center lg:px-2'
                      : 'px-3',
                    module.activePaths?.includes(pathname)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {module.icon}
                    <span
                      className={cn(
                        'transition-all duration-300',
                        !shouldShowContent &&
                          'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                      )}
                    >
                      {module.label}
                    </span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-all duration-300',
                      openModule === module.id &&
                        shouldShowContent &&
                        'rotate-90',
                      !shouldShowContent &&
                        'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                    )}
                  />
                </button>
                {shouldShowContent && openModule === module.id && (
                  <div
                    className={cn(
                      'ml-4 space-y-1 transition-all duration-300',
                      isCollapsed &&
                        isHovered &&
                        'lg:animate-in lg:slide-in-from-left-2'
                    )}
                  >
                    {module.items.map((item) => (
                      <ProtectedElement
                        key={item.href}
                        requiredRoles={item.roles}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300',
                            pathname === item.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </ProtectedElement>
                    ))}
                  </div>
                )}
              </div>
            </ProtectedElement>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div
          className={cn(
            'space-y-2 transition-all duration-300',
            !shouldShowContent && 'lg:opacity-0 lg:h-0 lg:overflow-hidden'
          )}
        >
          <div className="text-sm font-medium">
            Branch: {user?.branch?.name || 'Not specified'}
          </div>
          <div className="text-xs text-muted-foreground">
            Code:{' '}
            {user?.branch
              ? `B${user.branch.id.toString().padStart(3, '0')}`
              : 'N/A'}
            <br />
            {user?.branch?.address || 'Address not specified'}
          </div>
        </div>
      </div>
    </aside>
  );
}
