import {
    Calendar,
    Users,
    UserCog,
    Home,
    BarChart4,
    Building,
    Shield,
    CalendarDays,
    Package,
    Tags,
    Settings,
    Clock,
    ShoppingCart,
    ClipboardList,
    Table,
    LayoutGrid,
    CalendarRange,
    Calculator,
    Receipt,
    ChefHat,
    ShoppingBag,
} from 'lucide-react';

import { Role, employeeRole } from '@/lib/rbac';

interface ModuleItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: Role | Role[]; // optional - nếu không có thì tất cả đều có quyền truy cập
}

interface Module {
    id: string;
    label: string;
    icon: React.ReactNode;
    activePaths?: string[];
    roles?: Role | Role[]; // optional - nếu không có thì tất cả đều có quyền truy cập
    items: ModuleItem[];
}

interface StandaloneLink {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: Role | Role[]; // optional - nếu không có thì tất cả đều có quyền truy cập
}

interface SidebarConfig {
    modules: Module[];
    standaloneLinks: StandaloneLink[];
}

export const SIDEBAR_CONFIG: SidebarConfig = {
    modules: [
        {
            id: 'schedule',
            label: 'Schedule Management',
            icon: <Calendar className="h-5 w-5" />,
            activePaths: ['/app/schedule'],
            roles: [Role.MANAGER], // Temporarily commented out for debugging
            items: [
                {
                    href: '/app/schedule',
                    label: 'Schedule Overview',
                    icon: <BarChart4 className="h-4 w-4" />,
                },
                {
                    href: '/app/schedule/schedule',
                    label: 'Schedule Manager',
                    icon: <Calendar className="h-4 w-4" />,
                },
                {
                    href: '/app/schedule/working-shift',
                    label: 'Working Shift',
                    icon: <Clock className="h-4 w-4" />,
                },
                {
                    href: '/app/schedule/shift-leave',
                    label: 'Shift Leave Management',
                    icon: <ClipboardList className="h-4 w-4" />,
                },
            ],
        },
        {
            id: 'menu',
            label: 'Menu Module',
            icon: <Package className="h-5 w-5" />,
            activePaths: ['/app/menu'],
            roles: [Role.MANAGER], // Temporarily commented out for debugging
            items: [
                {
                    href: '/app/menu',
                    label: 'Menu Overview',
                    icon: <BarChart4 className="h-4 w-4" />,
                },
                {
                    href: '/app/menu/products',
                    label: 'Products',
                    icon: <Package className="h-4 w-4" />,
                },
                {
                    href: '/app/menu/food-combos',
                    label: 'Food Combos',
                    icon: <ShoppingCart className="h-4 w-4" />,
                },
                {
                    href: '/app/menu/categories/unified',
                    label: 'Categories',
                    icon: <Tags className="h-4 w-4" />,
                },
                {
                    href: '/app/menu/attributes',
                    label: 'Attributes',
                    icon: <Settings className="h-4 w-4" />,
                },
                // {
                //     href: '/app/menu/kitchen-printers',
                //     label: 'Kitchen Printers',
                //     icon: <Printer className="h-4 w-4" />,
                // },
            ],
        },
        {
            id: 'booking',
            label: 'Reservation',
            icon: <CalendarRange className="h-5 w-5" />,
            // activePaths: ['/app/booking'],
            roles: [Role.SUPPORT, Role.MANAGER],
            items: [
                {
                    href: '/app/reservation/table-reservation',
                    label: 'Table Reservation',
                    icon: <Table className="h-4 w-4" />,
                    roles: [Role.SUPPORT, Role.MANAGER],
                },
                {
                    href: '/app/reservation/pre-order',
                    label: 'Pre-order',
                    icon: <ShoppingBag className="h-4 w-4" />,
                    roles: [Role.MANAGER],
                },
            ],
        },
        {
            id: 'system',
            label: 'System',
            icon: <Shield className="h-5 w-5" />,
            activePaths: ['/app/system', '/app/branches'],
            roles: [Role.MANAGER], // Manager và System Admin mới có quyền
            items: [
                {
                    href: '/app/system/branches',
                    label: 'Branches',
                    icon: <Building className="h-4 w-4" />,
                    roles: [Role.SYSTEM_ADMIN], // Chỉ System Admin mới có quyền quản lý branch
                },
                {
                    href: '/app/system/employees',
                    label: 'Employees',
                    icon: <Users className="h-5 w-5" />,
                    roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Manager và System Admin mới có quyền
                },
                {
                    href: '/app/system/roles',
                    label: 'Roles',
                    icon: <UserCog className="h-4 w-4" />,
                    roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Chỉ System Admin mới có quyền quản lý role
                },
            ],
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-5 w-5" />,
            activePaths: ['/app/settings'],
            roles: [Role.MANAGER, Role.SYSTEM_ADMIN],
            items: [
                {
                    href: '/app/settings/schedule-configuration',
                    label: 'Schedule Configuration',
                    icon: <Calendar className="h-4 w-4" />,
                    roles: [Role.MANAGER, Role.SYSTEM_ADMIN],
                },
                {
                    href: '/app/settings/table-types',
                    label: 'Table Configuration',
                    icon: <Table className="h-4 w-4" />,
                    roles: [Role.MANAGER, Role.SYSTEM_ADMIN],
                },
                {
                    href: '/app/settings/floor-management',
                    label: 'Floor Management',
                    icon: <LayoutGrid className="h-4 w-4" />,
                    roles: [Role.MANAGER, Role.SYSTEM_ADMIN],
                },
            ],
        },
    ],
    standaloneLinks: [
        {
            href: '/app',
            label: 'Dashboard',
            icon: <Home className="h-5 w-5" />,
            roles: [Role.MANAGER], // Chỉ manager mới có quyền truy cập dashboard
        },
        {
            href: '/app/pos',
            label: 'Point of Sale',
            icon: <Calculator className="h-5 w-5" />,
            roles: [Role.MANAGER, Role.WAITER, Role.CASHIER],
        },
        {
            href: '/app/kds',
            label: 'Kitchen Display',
            icon: <ChefHat className="h-5 w-5" />,
            roles: [Role.MANAGER, Role.KITCHEN, Role.EMPLOYEE],
        },
        {
            href: '/app/employee-portal',
            label: 'Employee Portal',
            icon: <CalendarDays className="h-5 w-5" />,
            roles: employeeRole,
        },
        {
            href: '/app/employee-portal/shift-registration',
            label: 'Shift Registration',
            icon: <Calendar className="h-5 w-5" />,
            roles: employeeRole,
        },
        {
            href: '/app/employee-portal/shift-leave',
            label: 'Shift Leave Request',
            icon: <ClipboardList className="h-5 w-5" />,
            roles: employeeRole,
        },
    ],
};
