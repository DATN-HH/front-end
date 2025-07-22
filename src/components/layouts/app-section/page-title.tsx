'use client';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PageTitleProps {
    icon?: LucideIcon;
    title: string;
    left?: React.ReactNode;
    className?: string;
}

export function PageTitle({
    icon: Icon,
    title,
    left,
    className,
}: PageTitleProps) {
    return (
        <div
            className={cn(
                'mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className
            )}
        >
            <div className="flex items-center gap-2 sm:gap-4">
                {Icon && (
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                )}
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
            </div>
            {left && (
                <div className="flex items-center gap-2 sm:gap-2">{left}</div>
            )}
        </div>
    );
}
