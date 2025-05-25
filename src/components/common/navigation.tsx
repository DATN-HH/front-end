'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/common/logo';
import { useCart } from '@/contexts/cart-context';

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
    const { state } = useCart();

    const totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

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
                    <Link href="/cart">
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {totalItems > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                                    {totalItems}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-2" />
                            Login
                        </Button>
                    </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center space-x-2">
                    <Link href="/cart">
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {totalItems > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                                    {totalItems}
                                </Badge>
                            )}
                        </Button>
                    </Link>

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
                                    <Button className="w-full">
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
