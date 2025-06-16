'use client'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageTitleProps {
    icon?: LucideIcon
    title: string
    left?: React.ReactNode
    className?: string
}

export function PageTitle({ icon: Icon, title, left, className }: PageTitleProps) {
    return (
        <div className={cn('mb-6 flex items-center justify-between', className)}>
            <div className="flex items-center gap-4">
                {Icon && <Icon className="h-6 w-6 text-primary" />}
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            {left && <div className="flex items-center gap-2">{left}</div>}
        </div>
    )
} 