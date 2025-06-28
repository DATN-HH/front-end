import {
  Calendar,
  Users,
  UserCog,
  Home,
  BarChart4,
  BarChart3,
  FileText,
  Building,
  Shield,
  Copy,
  CalendarDays,
  Package,
  Tags,
  Settings,
  Printer,
  Clock,
} from 'lucide-react';

export const SIDEBAR_CONFIG = {
  modules: [
    {
      id: 'scheduling',
      label: 'Scheduling',
      icon: <Calendar className="h-5 w-5" />,
      activePaths: ['/app/scheduling', '/app/schedule'],
      items: [
        {
          href: '/app/scheduling/overview',
          label: 'Overview',
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          href: '/app/scheduling/schedule',
          label: 'Scheduling',
          icon: <BarChart4 className="h-4 w-4" />,
        },
        {
          href: '/app/scheduling/working-shift',
          label: 'Working Shifts',
          icon: <Clock className="h-4 w-4" />,
        },
        {
          href: '/app/scheduling/leave-management',
          label: 'Leave Management',
          icon: <CalendarDays className="h-4 w-4" />,
        },
      ],
    },
    {
      id: 'menu',
      label: 'Menu Module',
      icon: <Package className="h-5 w-5" />,
      activePaths: ['/app/menu'],
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
          href: '/app/menu/pos-categories',
          label: 'POS Categories',
          icon: <Tags className="h-4 w-4" />,
        },
        {
          href: '/app/menu/attributes',
          label: 'Attributes',
          icon: <Settings className="h-4 w-4" />,
        },
        {
          href: '/app/menu/kitchen-printers',
          label: 'Kitchen Printers',
          icon: <Printer className="h-4 w-4" />,
        },
      ],
    },
    {
      id: 'systemUser',
      label: 'System & User',
      icon: <Shield className="h-5 w-5" />,
      activePaths: ['/app/system', '/app/branches'],
      items: [
        {
          href: '/app/system/branches',
          label: 'Branch Management',
          icon: <Building className="h-4 w-4" />,
        },
        {
          href: '/app/system/roles',
          label: 'Role Management',
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          href: '/app/system/employees',
          label: 'Employees',
          icon: <Users className="h-5 w-5" />,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      activePaths: ['/app/settings'],
      items: [
        {
          href: '/app/settings/schedule-configuration',
          label: 'Schedule Configuration',
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
  ],
  standaloneLinks: [
    {
      href: '/app',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: '/app/employee-portal',
      label: 'Employee Portal',
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      href: '/app/employee-portal/leave-management',
      label: 'My Leave',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: '/app/employee-portal/shift-registration',
      label: 'Shift Registration',
      icon: <Calendar className="h-5 w-5" />,
    },
  ],
};