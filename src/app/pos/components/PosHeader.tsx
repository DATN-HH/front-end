'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Landmark,
    ClipboardList,
    Menu,
    ChevronDown,
    User,
} from 'lucide-react';
import { useCurrentPosSession, useLockPosSession } from '@/api/v1/pos';
import { usePosNotifications } from '@/api/v1/pos';
import UserSwitchingDropdown from './UserSwitchingDropdown';

interface PosHeaderProps {
    onCashInOut?: () => void;
    onOrdersClick?: () => void;
    onMenuClick?: () => void;
}

export default function PosHeader({ 
    onCashInOut, 
    onOrdersClick, 
    onMenuClick 
}: PosHeaderProps) {
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // API hooks
    const { data: session } = useCurrentPosSession();
    const { data: notifications = [] } = usePosNotifications(true); // unread only
    const lockSessionMutation = useLockPosSession();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get notification count for orders
    const orderNotificationCount = notifications.filter(n => n.type === 'ORDER').length;

    const handleLockSession = async () => {
        try {
            await lockSessionMutation.mutateAsync();
            setShowUserDropdown(false);
            // Navigation to login will be handled by the parent component
        } catch (error) {
            console.error('Failed to lock session:', error);
        }
    };

    return (
        <header className="bg-[#FFA500] h-16 px-4 flex items-center justify-between shadow-md">
            {/* Logo - Left Side */}
            <div className="flex items-center">
                <div className="text-2xl font-bold">
                    <span className="text-black">Menu</span>
                    <span className="text-[#FF8C00]">+</span>
                </div>
            </div>

            {/* Center Section */}
            <div className="flex items-center space-x-6">
                {/* Cash In/Out Button */}
                <Button
                    variant="ghost"
                    onClick={onCashInOut}
                    className="text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2"
                >
                    <Landmark className="h-5 w-5" />
                    <span className="hidden sm:inline">Cash In/Out</span>
                </Button>

                {/* Orders Button */}
                <Button
                    variant="ghost"
                    onClick={onOrdersClick}
                    className="text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2 relative"
                >
                    <ClipboardList className="h-5 w-5" />
                    <span className="hidden sm:inline">Orders</span>
                    {orderNotificationCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 bg-white text-black text-xs h-5 w-5 flex items-center justify-center p-0 min-w-[20px]"
                        >
                            {orderNotificationCount > 99 ? '99+' : orderNotificationCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                {/* User Info Area */}
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2 px-3 py-2"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        
                        {/* User Name */}
                        <span className="hidden md:inline font-medium">
                            {session?.user?.fullName || 'User'}
                        </span>
                        
                        {/* Dropdown Arrow */}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                    </Button>

                    {/* User Switching Dropdown */}
                    {showUserDropdown && (
                        <UserSwitchingDropdown
                            currentUser={session?.user}
                            onClose={() => setShowUserDropdown(false)}
                            onLockSession={handleLockSession}
                            isLocking={lockSessionMutation.isPending}
                        />
                    )}
                </div>

                {/* Hamburger Menu */}
                <Button
                    variant="ghost"
                    onClick={onMenuClick}
                    className="text-white hover:bg-white/10 transition-colors duration-200 p-2"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}