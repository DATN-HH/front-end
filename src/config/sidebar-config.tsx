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
  CalendarDays,
  Package,
  Tags,
  Settings,
  Printer,
  Clock,
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
      id: 'scheduling',
      label: 'Scheduling',
      icon: <Calendar className="h-5 w-5" />,
      activePaths: ['/app/scheduling'],
      roles: [Role.MANAGER], // Chỉ manager mới có quyền truy cập scheduling
      items: [
        {
          href: '/app/scheduling',
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
      roles: [Role.MANAGER], // Chỉ manager mới có quyền truy cập menu module
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
      roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Manager và System Admin mới có quyền
      items: [
        {
          href: '/app/system/branches',
          label: 'Branch Management',
          icon: <Building className="h-4 w-4" />,
          roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Chỉ System Admin mới có quyền quản lý branch
        },
        {
          href: '/app/system/roles',
          label: 'Role Management',
          icon: <UserCog className="h-4 w-4" />,
          roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Chỉ System Admin mới có quyền quản lý role
        },
        {
          href: '/app/system/employees',
          label: 'Employees',
          icon: <Users className="h-5 w-5" />,
          roles: [Role.MANAGER, Role.SYSTEM_ADMIN], // Manager và System Admin mới có quyền
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      activePaths: ['/app/settings'],
      roles: [Role.MANAGER], // Chỉ manager mới có quyền truy cập settings
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
      roles: [Role.MANAGER], // Chỉ manager mới có quyền truy cập dashboard 
    },
    {
      href: '/app/employee-portal',
      label: 'Employee Portal',
      icon: <CalendarDays className="h-5 w-5" />,
      roles: employeeRole,
    },
    {
      href: '/app/employee-portal/leave-management',
      label: 'My Leave',
      icon: <FileText className="h-5 w-5" />,
      roles: employeeRole,
    },
    {
      href: '/app/employee-portal/shift-registration',
      label: 'Shift Registration',
      icon: <Calendar className="h-5 w-5" />,
      roles: employeeRole,
    },
  ],
};