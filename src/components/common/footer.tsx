import { Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';

const branches = [
    {
        name: 'Le Bernardin - Midtown',
        address: '155 West 51st Street, New York, NY 10019',
        phone: '+1 (212) 554-1515',
        email: 'midtown@menuplus.com',
        hours: 'Tue-Sat: 5:30PM-10:00PM',
    },
    {
        name: 'Sakura Omakase - Mission',
        address: '2891 Mission Street, San Francisco, CA 94110',
        phone: '+1 (415) 282-8283',
        email: 'mission@menuplus.com',
        hours: 'Tue-Sun: 6:00PM-10:00PM',
    },
    {
        name: 'Menu+ Beverly Hills',
        address: '9500 Wilshire Boulevard, Beverly Hills, CA 90212',
        phone: '+1 (310) 555-0199',
        email: 'beverlyhills@menuplus.com',
        hours: 'Mon-Sun: 5:00PM-11:00PM',
    },
    {
        name: 'Menu+ Chicago Loop',
        address: '233 North Michigan Avenue, Chicago, IL 60601',
        phone: '+1 (312) 555-0145',
        email: 'chicago@menuplus.com',
        hours: 'Wed-Sun: 5:30PM-10:30PM',
    },
];

const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Menu', href: '/menu' },
    { name: 'Reservations', href: '/table-booking' },
    { name: 'Private Dining', href: '/private-dining' },
    { name: 'Gift Cards', href: '/gift-cards' },
    { name: 'Careers', href: '/careers' },
];

const policies = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cancellation Policy', href: '/cancellation-policy' },
    { name: 'Dress Code', href: '/dress-code' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'Health & Safety', href: '/health-safety' },
];

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            {/* Newsletter Section */}
            {/* <div className="border-b border-gray-800">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl font-serif font-bold mb-4">
                            Stay Connected
                        </h3>
                        <p className="text-gray-300 mb-6">
                            Subscribe to our newsletter for exclusive offers,
                            new menu items, and special events.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                            />
                            <Button className="bg-primary hover:bg-primary/90">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Logo className="text-white mb-4" />
                        <p className="text-gray-300 mb-6">
                            Elevating fine dining experiences across the nation.
                            Where culinary artistry meets exceptional service.
                        </p>
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white"
                            >
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white"
                            >
                                <Instagram className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white"
                            >
                                <Twitter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-serif font-semibold mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h4 className="text-lg font-serif font-semibold mb-4">
                            Policies & Info
                        </h4>
                        <ul className="space-y-2">
                            {policies.map((policy) => (
                                <li key={policy.name}>
                                    <Link
                                        href={policy.href}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {policy.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-serif font-semibold mb-4">
                            Contact
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-gray-300">
                                        Reservations
                                    </p>
                                    <p className="text-white font-medium">
                                        +1 (800) MENU-PLUS
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-gray-300">
                                        General Inquiries
                                    </p>
                                    <p className="text-white font-medium">
                                        info@menuplus.com
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-gray-300">
                                        Customer Service
                                    </p>
                                    <p className="text-white font-medium">
                                        Mon-Fri: 9AM-6PM EST
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Locations */}
                {/* <div className="mt-12 pt-8 border-t border-gray-800">
                    <h4 className="text-xl font-serif font-semibold mb-6 text-center">
                        Our Locations
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {branches.map((branch, index) => (
                            <div key={index} className="text-center">
                                <h5 className="font-semibold text-white mb-2">
                                    {branch.name}
                                </h5>
                                <div className="space-y-1 text-sm text-gray-300">
                                    <div className="flex items-start justify-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <p>{branch.address}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <p>{branch.phone}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <p>{branch.hours}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 Menu+ Fine Dining. All rights reserved. |
                            Designed for exceptional experiences.
                        </p>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <span className="text-gray-400 text-sm">
                                Powered by culinary excellence
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
