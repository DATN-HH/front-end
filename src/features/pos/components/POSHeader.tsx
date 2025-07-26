'use client';

import { Search, User, Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

// Import POS components
import { CashInOutDialog } from './CashInOutDialog';

interface POSHeaderProps {
    currentTab: 'tables' | 'register' | 'orders';
    tableNumber?: string | null;
    branchName?: string;
    onSearch?: (query: string) => void;
}

export function POSHeader({
    currentTab,
    tableNumber,
    branchName,
    onSearch
}: POSHeaderProps) {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch?.(value);
    };

    const handleMenuAction = (action: string) => {
        // Handle menu actions based on the case study requirements
        switch (action) {
            case 'cash-in-out':
                setIsCashDialogOpen(true);
                break;
            case 'reload-data':
                // TODO: Reload POS data
                console.log('Reloading POS data');
                break;
            case 'create-product':
                // TODO: Navigate to product creation
                window.location.href = '/app/menu/products';
                break;
            case 'backend':
                // TODO: Navigate to backend/admin
                window.location.href = '/app';
                break;
            case 'close-register':
                // TODO: Open register closing dialog
                console.log('Opening register closing dialog');
                break;
            default:
                break;
        }
    };

    const tabs = [
        { id: 'tables', label: 'Tables', href: '/app/pos/tables' },
        { id: 'register', label: 'Register', href: '/app/pos/register' },
        { id: 'orders', label: 'Orders', href: '/app/pos/orders' },
    ];

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Navigation Tabs + Table Indicator */}
                <div className="flex items-center space-x-6">
                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-1">
                        {tabs.map((tab) => (
                            <Link key={tab.id} href={tab.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'px-4 py-2 rounded-lg font-medium transition-colors',
                                        currentTab === tab.id
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    {tab.label}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {/* Table Indicator */}
                    {tableNumber && (
                        <div className="text-xl font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
                            {tableNumber}
                        </div>
                    )}
                </div>

                {/* Right: Search and Menu */}
                <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    {(currentTab === 'register' || currentTab === 'orders') && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                    )}

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">{user?.fullName || user?.username}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem disabled>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user?.fullName || user?.username}</span>
                                    <span className="text-sm text-gray-500">{branchName}</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                Switch to Dark Mode
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMenuAction('cash-in-out')}>
                                Cash In/Out
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMenuAction('reload-data')}>
                                Reload Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMenuAction('create-product')}>
                                Create Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleMenuAction('backend')}>
                                Backend
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMenuAction('close-register')}>
                                Close Register
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Main Menu */}
                    <Button variant="ghost" size="sm">
                        <MenuIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Cash In/Out Dialog */}
            <CashInOutDialog
                isOpen={isCashDialogOpen}
                onClose={() => setIsCashDialogOpen(false)}
            />
        </header>
    );
}
