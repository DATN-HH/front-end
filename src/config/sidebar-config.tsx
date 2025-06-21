import {
  Calendar,
  Users,
  UserCog,
  Home,
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
          href: '/app/scheduling/schedule',
          label: 'Schedule Overview',
          icon: <BarChart4 className="h-4 w-4" />,
        },
        {
          href: '/app/scheduling/working-shift',
          label: 'Working Shifts',
          icon: <Clock className="h-4 w-4" />,
        },
        {
          href: '/app/scheduling/requests',
          label: 'Time-off Requests',
          icon: <FileText className="h-4 w-4" />,
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
  ],
};