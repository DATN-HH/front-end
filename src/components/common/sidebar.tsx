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
    const [schedulingOpen, setSchedulingOpen] = useState(true);
    const [systemUserOpen, setSystemUserOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(true);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
            <div className="flex flex-col gap-2 p-4 overflow-y-auto">
                <Link
                    href="/dashboard"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/dashboard') && 'bg-orange-50 text-orange-500'
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Planning Module */}
                <div>
                    <button
                        onClick={() => setSchedulingOpen(!schedulingOpen)}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            (pathname.includes('/dashboard/planning') ||
                                pathname.includes('/dashboard/scheduling') ||
                                pathname.includes('/dashboard/employees')) &&
                                'bg-orange-50 text-orange-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span>Planning Module</span>
                        </div>
                        {schedulingOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {schedulingOpen && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/dashboard/planning"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/planning') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Planning Overview</span>
                            </Link>
                            <Link
                                href="/dashboard/scheduling/schedule"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/scheduling/schedule') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Schedule Overview</span>
                            </Link>
                            <Link
                                href="/dashboard/scheduling/assign"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/scheduling/assign') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Users className="h-4 w-4" />
                                <span>Assign Staff</span>
                            </Link>
                            <Link
                                href="/dashboard/scheduling/copy"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/scheduling/copy') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy Schedule</span>
                            </Link>
                            <Link
                                href="/dashboard/scheduling/requests"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/scheduling/requests') &&
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
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            pathname.includes('/dashboard/menu') &&
                                'bg-blue-50 text-blue-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            <span>Menu Module</span>
                        </div>
                        {menuOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {menuOpen && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/dashboard/menu"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/menu') &&
                                        'bg-blue-50 text-blue-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Menu Overview</span>
                            </Link>
                            <Link
                                href="/dashboard/menu/products"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/dashboard/menu/products') &&
                                        'bg-blue-50 text-blue-500'
                                )}
                            >
                                <Package className="h-4 w-4" />
                                <span>Products</span>
                            </Link>
                            <Link
                                href="/dashboard/menu/pos-categories"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/dashboard/menu/pos-categories') &&
                                        'bg-blue-50 text-blue-500'
                                )}
                            >
                                <Tags className="h-4 w-4" />
                                <span>POS Categories</span>
                            </Link>
                            <Link
                                href="/dashboard/menu/attributes"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/dashboard/menu/attributes') &&
                                        'bg-blue-50 text-blue-500'
                                )}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Attributes</span>
                            </Link>
                            <Link
                                href="/dashboard/menu/kitchen-printers"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    pathname.includes('/dashboard/menu/kitchen-printers') &&
                                        'bg-blue-50 text-blue-500'
                                )}
                            >
                                <Printer className="h-4 w-4" />
                                <span>Kitchen Printers</span>
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    href="/dashboard/scheduling/employee-portal"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/dashboard/scheduling/employee-portal') &&
                            'bg-orange-50 text-orange-500'
                    )}
                >
                    <CalendarDays className="h-5 w-5" />
                    <span>Employee Portal</span>
                </Link>

                <div>
                    <button
                        onClick={() => setSystemUserOpen(!systemUserOpen)}
                        className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100',
                            (pathname.includes('/dashboard/system') ||
                                pathname.includes('/dashboard/branches')) &&
                                'bg-orange-50 text-orange-500'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span>System & User</span>
                        </div>
                        {systemUserOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {systemUserOpen && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/dashboard/system/branches"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/system/branches') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Building className="h-4 w-4" />
                                <span>Branch Management</span>
                            </Link>
                            <Link
                                href="/dashboard/system/roles"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/system/roles') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <UserCog className="h-4 w-4" />
                                <span>Role Management</span>
                            </Link>
                            <Link
                                href="/dashboard/system/employees"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/dashboard/system/employees') &&
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
