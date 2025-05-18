'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Users,
    Settings,
    Clock,
    UserCog,
    Home,
    ChevronDown,
    ChevronRight,
    BarChart4,
    Bell,
    FileText,
    Building,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [schedulingOpen, setSchedulingOpen] = useState(true);
    const [systemUserOpen, setSystemUserOpen] = useState(true);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">
            <div className="flex items-center p-4 border-b">
                <Link
                    href="/app"
                    className="flex items-center gap-1 font-bold text-xl"
                >
                    <span>Menu</span>
                    <span className="text-primary">+</span>
                </Link>
            </div>

            <div className="flex flex-col gap-2 p-4">
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

                <div>
                    <button
                        onClick={() => setSchedulingOpen(!schedulingOpen)}
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
                        {schedulingOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {schedulingOpen && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                            <Link
                                href="/app/scheduling/roles"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/roles') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <UserCog className="h-4 w-4" />
                                <span>Job Roles</span>
                            </Link>
                            <Link
                                href="/app/scheduling/shifts"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/shifts') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <Clock className="h-4 w-4" />
                                <span>Work Shifts</span>
                            </Link>
                            <Link
                                href="/app/scheduling/schedule"
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                                    isActive('/app/scheduling/schedule') &&
                                        'bg-orange-50 text-orange-500'
                                )}
                            >
                                <BarChart4 className="h-4 w-4" />
                                <span>Schedule (Gantt)</span>
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
                            {/* <Link
                href="/app/scheduling/notifications"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                  isActive('app/scheduling/notifications') &&
                    'bg-orange-50 text-orange-500'
                )}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </Link> */}
                        </div>
                    )}
                </div>

                <Link
                    href="/app/employees"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/app/employees') &&
                            'bg-orange-50 text-orange-500'
                    )}
                >
                    <Users className="h-5 w-5" />
                    <span>Employees</span>
                </Link>

                <Link
                    href="/app/employee-portal"
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
                        isActive('/app/employee-portal') &&
                            'bg-orange-50 text-orange-500'
                    )}
                >
                    <Users className="h-5 w-5" />
                    <span>Employee Portal</span>
                </Link>

                {/* System & User Group */}
                <div>
                    <button
                        onClick={() => setSystemUserOpen(!systemUserOpen)}
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
                        {systemUserOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    {systemUserOpen && (
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
                            {/* Add other System & User menu items here */}
                        </div>
                    )}
                </div>

                {/* <Link
          href="/app/settings"
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100',
            isActive('/settings') && 'bg-orange-50 text-orange-500'
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link> */}
            </div>
        </div>
    );
}
