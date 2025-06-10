'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Users,
    Clock,
    UserCog,
    Home,
    ChevronDown,
    ChevronRight,
    BarChart4,
    FileText,
    Building,
    Shield,
    Copy,
    CalendarDays,
    Package,
    Tags,
    Settings,
    Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    
    // Enum for module types to avoid string errors
    type ModuleType = 'scheduling' | 'menu' | 'systemUser';
    
    // Single state to track which module is open
    const [openModule, setOpenModule] = useState<ModuleType | null>(() => {
        // Set initial open module based on pathname
        if (pathname.includes('/app/scheduling')) return 'scheduling';
        if (pathname.includes('/app/menu')) return 'menu';
        if (pathname.includes('/app/system') || pathname.includes('/app/branches')) return 'systemUser';
        return null;
    });

    // Helper to toggle module state
    const toggleModule = (module: ModuleType) => {
        setOpenModule(current => current === module ? null : module);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
            <div className="flex flex-col gap-2 p-4 overflow-y-auto">
                <Link
                    href="/app"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/app') && 'bg-orange-50 text-orange-500'
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Schedule Module */}
                <div>
                    <button
                        onClick={() => toggleModule('scheduling')}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            (pathname.includes('/app/scheduling') ||
                                pathname.includes('/app/schedule')) &&
                                'bg-orange-50 text-orange-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span>Scheduling</span>
                        </div>
                        {openModule === 'scheduling' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {openModule === 'scheduling' && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/app/scheduling/schedule"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/schedule') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Schedule Overview</span>
                            </Link>
                            <Link
                                href="/app/scheduling/assign"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/assign') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Users className="h-4 w-4" />
                                <span>Assign Staff</span>
                            </Link>
                            <Link
                                href="/app/scheduling/copy"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/copy') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy Schedule</span>
                            </Link>
                            <Link
                                href="/app/scheduling/requests"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/requests') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                <span>Time-off Requests</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Menu Module */}
                <div>
                    <button
                        onClick={() => toggleModule('menu')}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            pathname.includes('/app/menu') &&
                                'bg-orange-50 text-orange-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            <span>Menu Module</span>
                        </div>
                        {openModule === 'menu' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {openModule === 'menu' && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/app/menu"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/menu') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Menu Overview</span>
                            </Link>
                            <Link
                                href="/app/menu/products"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/app/menu/products') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Package className="h-4 w-4" />
                                <span>Products</span>
                            </Link>
                            <Link
                                href="/app/menu/pos-categories"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/app/menu/pos-categories') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Tags className="h-4 w-4" />
                                <span>POS Categories</span>
                            </Link>
                            <Link
                                href="/app/menu/attributes"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/app/menu/attributes') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Attributes</span>
                            </Link>
                            <Link
                                href="/app/menu/kitchen-printers"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/app/menu/kitchen-printers') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Printer className="h-4 w-4" />
                                <span>Kitchen Printers</span>
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    href="/app/employee-portal"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/app/employee-portal') &&
                            'bg-orange-50 text-orange-500'
                    )}
                >
                    <CalendarDays className="h-5 w-5" />
                    <span>Employee Portal</span>
                </Link>

                <div>
                    <button
                        onClick={() => toggleModule('systemUser')}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            (pathname.includes('/app/system') ||
                                pathname.includes('/app/branches')) &&
                                'bg-orange-50 text-orange-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span>System & User</span>
                        </div>
                        {openModule === 'systemUser' ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {openModule === 'systemUser' && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/app/system/branches"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/system/branches') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Building className="h-4 w-4" />
                                <span>Branch Management</span>
                            </Link>
                            <Link
                                href="/app/system/roles"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/system/roles') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <UserCog className="h-4 w-4" />
                                <span>Role Management</span>
                            </Link>
                            <Link
                                href="/app/system/employees"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/system/employees') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Users className="h-5 w-5" />
                                <span>Employees</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}