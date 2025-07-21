export interface SearchRoute {
  label: string;
  path: string;
  description?: string;
}

export const searchRoutes: SearchRoute[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Trang tổng quan hệ thống',
  },
  {
    label: 'Quản lý đơn hàng',
    path: '/orders',
    description: 'Xem và quản lý đơn hàng',
  },
  {
    label: 'Quản lý sản phẩm',
    path: '/products',
    description: 'Xem và quản lý sản phẩm',
  },
  {
    label: 'Quản lý khách hàng',
    path: '/customers',
    description: 'Xem và quản lý thông tin khách hàng',
  },
  {
    label: 'Báo cáo',
    path: '/reports',
    description: 'Xem các báo cáo và thống kê',
  },
  {
    label: 'Cài đặt',
    path: '/settings',
    description: 'Cài đặt hệ thống',
  },
];
