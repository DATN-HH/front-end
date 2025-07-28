'use client';

import { Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { CartSidebar } from '@/components/common/CartSidebar';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
                    <Link href="/login">
                        <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            Login
                        </Button>
                    </Link>
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
                                    <Button
                                        className="w-full"
                                        onClick={() => router.push('/login')}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Login / Register
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
