'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Check,
    // Restaurant & Dining
    UtensilsCrossed,
    Coffee,
    Wine,
    ChefHat,
    // Tables & Furniture
    Table,
    Armchair,
    Sofa,
    // VIP & Premium
    Crown,
    Star,
    Award,
    Diamond,
    Gem,
    // Locations & Spaces
    TreePalm,
    Mountain,
    Waves,
    Sun,
    Cloud,
    // Privacy & Special
    Lock,
    Eye,
    Shield,
    Key,
    // Romance & Couple
    Heart,
    HeartHandshake,
    Sparkles,
    // Family & Groups
    Users,
    Users2,
    UserCheck,
    Baby,
    // Business & Work
    Briefcase,
    Building,
    Building2,
    Laptop,
    Phone,
    // Smoking & Health
    Cigarette,
    Ban,
    Zap,
    // Accessibility
    Accessibility,
    // Activities & Entertainment
    Music,
    Gamepad2,
    Tv,
    Camera,
    // Food & Beverages
    Pizza,
    Cookie,
    Fish,
    Apple,
    // Comfort & Ambiance
    Flame,
    Snowflake,
    Fan,
    Lightbulb,
    // Service & Staff
    Bell,
    Clock,
    Calendar,
    // Special Events
    PartyPopper,
    Gift,
    Cake,
    // Transport & Location
    Car,
    Plane,
    MapPin,
    Navigation,
} from 'lucide-react';

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    label?: string;
    error?: string;
}

// Comprehensive icon list with categories
const iconCategories = [
    {
        name: 'Tables & Furniture',
        icons: [
            { name: 'Table', icon: Table },
            { name: 'Armchair', icon: Armchair },
            { name: 'Sofa', icon: Sofa },
        ]
    },
    {
        name: 'VIP & Premium',
        icons: [
            { name: 'Crown', icon: Crown },
            { name: 'Star', icon: Star },
            { name: 'Award', icon: Award },
            { name: 'Diamond', icon: Diamond },
            { name: 'Gem', icon: Gem },
        ]
    },
    {
        name: 'Restaurant & Dining',
        icons: [
            { name: 'UtensilsCrossed', icon: UtensilsCrossed },
            { name: 'Coffee', icon: Coffee },
            { name: 'Wine', icon: Wine },
            { name: 'ChefHat', icon: ChefHat },
            { name: 'Pizza', icon: Pizza },
            { name: 'Cookie', icon: Cookie },
            { name: 'Fish', icon: Fish },
            { name: 'Apple', icon: Apple },
        ]
    },
    {
        name: 'Locations & Ambiance',
        icons: [
            { name: 'TreePalm', icon: TreePalm },
            { name: 'Mountain', icon: Mountain },
            { name: 'Waves', icon: Waves },
            { name: 'Sun', icon: Sun },
            { name: 'Cloud', icon: Cloud },
            { name: 'Flame', icon: Flame },
            { name: 'Snowflake', icon: Snowflake },
            { name: 'Fan', icon: Fan },
            { name: 'Lightbulb', icon: Lightbulb },
        ]
    },
    {
        name: 'Privacy & Special',
        icons: [
            { name: 'Lock', icon: Lock },
            { name: 'Eye', icon: Eye },
            { name: 'Shield', icon: Shield },
            { name: 'Key', icon: Key },
        ]
    },
    {
        name: 'Romance & Couple',
        icons: [
            { name: 'Heart', icon: Heart },
            { name: 'HeartHandshake', icon: HeartHandshake },
            { name: 'Sparkles', icon: Sparkles },
        ]
    },
    {
        name: 'Family & Groups',
        icons: [
            { name: 'Users', icon: Users },
            { name: 'Users2', icon: Users2 },
            { name: 'UserCheck', icon: UserCheck },
            { name: 'Baby', icon: Baby },
        ]
    },
    {
        name: 'Business & Work',
        icons: [
            { name: 'Briefcase', icon: Briefcase },
            { name: 'Building', icon: Building },
            { name: 'Building2', icon: Building2 },
            { name: 'Laptop', icon: Laptop },
            { name: 'Phone', icon: Phone },
        ]
    },
    {
        name: 'Health & Accessibility',
        icons: [
            { name: 'Cigarette', icon: Cigarette },
            { name: 'Ban', icon: Ban },
            { name: 'Accessibility', icon: Accessibility },
            { name: 'Zap', icon: Zap },
        ]
    },
    {
        name: 'Entertainment',
        icons: [
            { name: 'Music', icon: Music },
            { name: 'Gamepad2', icon: Gamepad2 },
            { name: 'Tv', icon: Tv },
            { name: 'Camera', icon: Camera },
        ]
    },
    {
        name: 'Service & Events',
        icons: [
            { name: 'Bell', icon: Bell },
            { name: 'Clock', icon: Clock },
            { name: 'Calendar', icon: Calendar },
            { name: 'PartyPopper', icon: PartyPopper },
            { name: 'Gift', icon: Gift },
            { name: 'Cake', icon: Cake },
        ]
    },
    {
        name: 'Transport & Location',
        icons: [
            { name: 'Car', icon: Car },
            { name: 'Plane', icon: Plane },
            { name: 'MapPin', icon: MapPin },
            { name: 'Navigation', icon: Navigation },
        ]
    }
];

// Flatten all icons for search
const allIcons = iconCategories.flatMap(category =>
    category.icons.map(icon => ({ ...icon, category: category.name }))
);

export function IconPicker({ value, onChange, label, error }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedIcon = iconCategories
        .flatMap(category => category.icons)
        .find(icon => icon.name === value);

    const filteredCategories = iconCategories
        .map(category => ({
            ...category,
            icons: category.icons.filter(icon =>
                icon.name.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(category => category.icons.length > 0);

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setOpen(false);
        setSearch('');
    };

    // Add wheel event handler to fix scroll in modal
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            scrollElement.scrollTop += e.deltaY;
        };

        scrollElement.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            scrollElement.removeEventListener('wheel', handleWheel);
        };
    }, [open]);

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-full justify-start h-10 ${error ? 'border-red-500' : ''}`}
                    >
                        {selectedIcon ? (
                            <div className="flex items-center gap-2">
                                <selectedIcon.icon className="w-4 h-4" />
                                <span>{selectedIcon.name}</span>
                            </div>
                        ) : (
                            <span className="text-gray-500">Select an icon...</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] sm:w-[500px] p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search icons..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div
                        ref={scrollRef}
                        className="h-80 overflow-y-auto border-t"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        <div className="p-3 space-y-4">
                            {filteredCategories.map(category => (
                                <div key={category.name}>
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                        {category.name}
                                    </Badge>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                        {category.icons.map(icon => {
                                            const isSelected = value === icon.name;
                                            return (
                                                <button
                                                    key={icon.name}
                                                    onClick={() => handleSelect(icon.name)}
                                                    className={`
                            relative p-2 rounded-md border-2 transition-colors
                            hover:bg-gray-50 flex flex-col items-center gap-1
                            ${isSelected
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200'
                                                        }
                          `}
                                                    title={icon.name}
                                                >
                                                    <icon.icon className="w-4 h-4" />
                                                    {isSelected && (
                                                        <Check className="absolute -top-1 -right-1 w-3 h-3 text-blue-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {filteredCategories.length === 0 && (
                                <div className="text-center text-gray-500 py-6">
                                    No icons found matching "{search}"
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
} 