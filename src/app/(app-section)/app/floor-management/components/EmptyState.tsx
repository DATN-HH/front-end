'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon = <Building2 className="w-12 h-12 text-muted-foreground" />,
    className
}: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div className="mb-4">
                    {icon}
                </div>
                <h3 className="text-lg sm:text-xl font-medium mb-2">
                    {title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
} 