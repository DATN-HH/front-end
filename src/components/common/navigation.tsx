'use client';

import {
    Menu,
    User,
    LogOut,
    ShoppingBag,
    CalendarDays,
    Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { CartSidebar } from '@/components/common/CartSidebar';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth, getDefaultRedirectByRole } from '@/contexts/auth-context';

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/menu', label: 'Menu' },
    { href: '/table-booking', label: 'Table Booking' },
    { href: '/menu-booking', label: 'Pre-Order' },
    { href: '/contact', label: 'Contact' },
];

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const handlePortalRedirect = () => {
        if (user?.userRoles && user.userRoles.length > 0) {
            const targetUrl = getDefaultRedirectByRole(user.userRoles[0].role);
            router.push(targetUrl);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                pathname === item.href
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    <CartSidebar />
                    {isAuthenticated() ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    {user?.fullName || user?.username}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.push('/my-orders')}
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    My Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push('/my-bookings')}
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Table Bookings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push('/my-pre-orders')
                                    }
                                >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Pre-Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push('/profile')}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Profile Settings
                                </DropdownMenuItem>
                                {user?.userRoles &&
                                    user.userRoles.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={handlePortalRedirect}
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Go to Portal
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center space-x-2">
                    <CartSidebar />

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[400px]"
                        >
                            <div className="flex flex-col space-y-4 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-lg font-medium transition-colors hover:text-primary ${
                                            pathname === item.href
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <div className="pt-4 border-t">
                                    {isAuthenticated() ? (
                                        <>
                                            <div className="mb-4 px-2">
                                                <p className="font-semibold">
                                                    {user?.fullName ||
                                                        user?.username}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        router.push(
                                                            '/my-orders'
                                                        );
                                                    }}
                                                >
                                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                                    My Orders
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        router.push(
                                                            '/my-bookings'
                                                        );
                                                    }}
                                                >
                                                    <CalendarDays className="mr-2 h-4 w-4" />
                                                    Table Bookings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() =>
                                                        router.push(
                                                            '/my-pre-orders'
                                                        )
                                                    }
                                                >
                                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                                    Pre-Orders
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        router.push('/profile');
                                                    }}
                                                >
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Profile Settings
                                                </Button>
                                                {user?.userRoles &&
                                                    user.userRoles.length >
                                                        0 && (
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start"
                                                            onClick={() => {
                                                                setIsOpen(
                                                                    false
                                                                );
                                                                handlePortalRedirect();
                                                            }}
                                                        >
                                                            <User className="mr-2 h-4 w-4" />
                                                            Go to Portal
                                                        </Button>
                                                    )}
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        handleLogout();
                                                    }}
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Logout
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push('/login');
                                            }}
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Login / Register
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
