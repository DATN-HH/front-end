'use client';
import { Settings, Menu } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '@/contexts/auth-context';

import { NotificationCenter } from './notification-center';

interface SectionHeaderProps {
    onMobileSidebarToggle?: () => void;
    isMobileSidebarOpen?: boolean;
}

export function SectionHeader({
    onMobileSidebarToggle,
    isMobileSidebarOpen,
}: SectionHeaderProps) {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white shadow-sm px-4 lg:px-6">
            {/* Left section - Mobile menu button + Search */}
            <div className="flex items-center gap-2 lg:gap-4 flex-1">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMobileSidebarToggle}
                    className="lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search */}
                <div className="w-full max-w-sm lg:w-[400px]">
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full border-gray-200 focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Notifications */}
                <NotificationCenter />

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-primary hover:bg-primary/10"
                >
                    <Settings className="h-5 w-5" />
                </Button>

                {/* Language Switcher - Hide on very small screens */}
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-8 w-8 rounded-full hover:bg-primary/10"
                        >
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                                {/* <AvatarImage src="/avatars/01.png" alt="User" /> */}
                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                    {user?.fullName
                                        ? user.fullName.charAt(0).toUpperCase()
                                        : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-gray-900">
                                    {user?.fullName || 'User'}
                                </p>
                                <p className="text-xs leading-none text-gray-500">
                                    {user?.email || 'No email'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50">
                            Personal profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50">
                            Account settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700"
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
