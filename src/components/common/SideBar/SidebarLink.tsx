import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick?: () => void;
}

export function SidebarLink({
    href,
    icon,
    label,
    isActive,
    onClick,
}: SidebarLinkProps) {
    return (
        <Link
            onClick={onClick}
            href={href}
            className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                isActive && 'bg-orange-50 text-orange-500'
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
