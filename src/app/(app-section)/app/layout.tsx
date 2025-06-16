'use client'
import { ReactNode } from 'react'
import { SectionSidebar } from '@/components/layouts/app-section/sidebar'
import { SectionHeader } from '@/components/layouts/app-section/header'
import { SectionBreadcrumb } from '@/components/layouts/app-section/breadcrumb'
import Providers from '@/app/providers'
import { Toaster } from '@/components/ui/toaster'

interface SectionLayoutProps {
    children: ReactNode
}

export default function SectionLayout({ children }: SectionLayoutProps) {
    return (
        <Providers>
            <div className="flex h-screen bg-background">
                <SectionSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <SectionHeader />
                    <div className="flex-1 overflow-auto p-6">
                        <SectionBreadcrumb />
                        <main className="mt-4">{children}</main>
                    </div>
                </div>
            </div>
            <Toaster />
        </Providers>
    )
} 