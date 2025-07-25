import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SectionBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: vi });

    // Helper function to format segment (e.g., "shift-manage" -> "Shift Manage")
    const formatSegment = (segment: string) => {
        return segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Link
                    href="/"
                    className="flex items-center hover:text-foreground"
                >
                    <Home className="h-4 w-4" />
                </Link>
                {segments.map((segment, index) => (
                    <div key={segment} className="flex items-center">
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            href={`/${segments.slice(0, index + 1).join('/')}`}
                            className="ml-1 hover:text-foreground truncate"
                        >
                            {formatSegment(segment)}
                        </Link>
                    </div>
                ))}
            </nav>
            <div className="text-sm text-muted-foreground hidden sm:block sm:text-right">
                {currentDate}
            </div>
        </div>
    );
}
