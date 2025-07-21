# DataTable Component - Hướng dẫn sử dụng

## 📖 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Cách sử dụng cơ bản](#cách-sử-dụng-cơ-bản)
- [Props và tính năng](#props-và-tính-năng)
- [Ví dụ chi tiết](#ví-dụ-chi-tiết)
- [Tính năng nâng cao](#tính-năng-nâng-cao)
- [Customization](#customization)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## 🚀 Giới thiệu

DataTable là một component table mạnh mẽ và linh hoạt được xây dựng trên TanStack Table v8, cung cấp đầy đủ các tính năng cần thiết cho việc hiển thị và quản lý dữ liệu.

### ✨ Tính năng chính:

- ✅ **Phân trang** (Pagination) với server-side support
- ✅ **Tìm kiếm** (Search) và **Bộ lọc nâng cao** (Advanced Filters)
- ✅ **Sắp xếp** (Sorting) đa cấp với server-side support
- ✅ **Pin columns** (ghim cột) trái/phải
- ✅ **Drag & Drop** để thay đổi thứ tự cột
- ✅ **Ẩn/hiện cột** (Column visibility)
- ✅ **Export** dữ liệu (CSV, Excel)
- ✅ **Sticky header** khi scroll
- ✅ **Loading states** và **Empty states**
- ✅ **Responsive design**
- ✅ **Lưu trạng thái** vào localStorage
- ✅ **Dark mode** support

## 📦 Cài đặt

Component đã được tích hợp sẵn trong project. Import và sử dụng:

```tsx
import { DataTable } from '@/components/common/Table/DataTable';
import type { FilterDefinition } from '@/components/common/Table/types';
```

## 🎯 Cách sử dụng cơ bản

### Ví dụ đơn giản:

```tsx
import { DataTable } from '@/components/common/Table/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const MyComponent = () => {
    // Định nghĩa columns
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'name',
            header: 'Tên',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Vai trò',
        },
    ];

    // Dữ liệu mẫu
    const data: User[] = [
        { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'Admin' },
        { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'User' },
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            tableId="user-table"
            pageIndex={0}
            pageSize={10}
            total={data.length}
            onPaginationChange={(pageIndex, pageSize) => {
                console.log('Pagination changed:', { pageIndex, pageSize });
            }}
            onSortingChange={(sorting) => {
                console.log('Sorting changed:', sorting);
            }}
            onFilterChange={(filters) => {
                console.log('Filters changed:', filters);
            }}
            onSearchChange={(searchTerm) => {
                console.log('Search changed:', searchTerm);
            }}
        />
    );
};
```

## 🔧 Props và tính năng

### Required Props

| Prop        | Type                         | Mô tả                                         |
| ----------- | ---------------------------- | --------------------------------------------- |
| `columns`   | `ColumnDef<TData, TValue>[]` | Định nghĩa các cột                            |
| `data`      | `TData[]`                    | Dữ liệu hiển thị                              |
| `tableId`   | `string`                     | ID duy nhất cho table (dùng cho localStorage) |
| `pageIndex` | `number`                     | Trang hiện tại (0-based)                      |
| `pageSize`  | `number`                     | Số dòng trên mỗi trang                        |
| `total`     | `number`                     | Tổng số dòng dữ liệu                          |

### Callback Props

| Prop                 | Type                                            | Mô tả                            |
| -------------------- | ----------------------------------------------- | -------------------------------- |
| `onPaginationChange` | `(pageIndex: number, pageSize: number) => void` | Callback khi phân trang thay đổi |
| `onSortingChange`    | `(sorting: string) => void`                     | Callback khi sắp xếp thay đổi    |
| `onFilterChange`     | `(filters: SearchCondition[]) => void`          | Callback khi bộ lọc thay đổi     |
| `onSearchChange`     | `(searchTerm: string) => void`                  | Callback khi tìm kiếm thay đổi   |

### Optional Props

| Prop                   | Type                                  | Default     | Mô tả                                                                 |
| ---------------------- | ------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `currentSorting`       | `string`                              | `''`        | Trạng thái sắp xếp hiện tại (`"columnId:asc"` hoặc `"columnId:desc"`) |
| `filterDefinitions`    | `FilterDefinition[]`                  | `[]`        | Định nghĩa bộ lọc nâng cao                                            |
| `initialColumnPinning` | `{left?: string[], right?: string[]}` | `undefined` | Ghim cột ban đầu                                                      |
| `loading`              | `boolean`                             | `false`     | Hiển thị trạng thái loading                                           |

### Feature Toggle Props

| Prop                     | Type      | Default | Mô tả                      |
| ------------------------ | --------- | ------- | -------------------------- |
| `enableSearch`           | `boolean` | `true`  | Bật/tắt tính năng tìm kiếm |
| `enableColumnVisibility` | `boolean` | `true`  | Bật/tắt ẩn/hiện cột        |
| `enableSorting`          | `boolean` | `true`  | Bật/tắt sắp xếp            |
| `enablePinning`          | `boolean` | `true`  | Bật/tắt ghim cột           |
| `enableColumnOrdering`   | `boolean` | `true`  | Bật/tắt drag & drop cột    |
| `enableFiltering`        | `boolean` | `true`  | Bật/tắt bộ lọc             |
| `enablePagination`       | `boolean` | `true`  | Bật/tắt phân trang         |
| `enableExport`           | `boolean` | `true`  | Bật/tắt export             |

## 📋 Ví dụ chi tiết

### 1. Table với Actions và Selection

```tsx
const columns: ColumnDef<User>[] = [
    // Checkbox selection
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        meta: { pin: 'left' }, // Ghim cột này sang trái
    },
    {
        accessorKey: 'name',
        header: 'Tên',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Vai trò',
        cell: ({ row }) => {
            const role = row.getValue('role') as string;
            return (
                <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>
                    {role}
                </Badge>
            );
        },
    },
    // Actions column
    {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                    Sửa
                </Button>
                <Button size="sm" variant="destructive">
                    Xóa
                </Button>
            </div>
        ),
        meta: { pin: 'right' }, // Ghim cột này sang phải
    },
];
```

### 2. Table với Bộ lọc nâng cao

```tsx
const filterDefinitions: FilterDefinition[] = [
    {
        id: 'role',
        label: 'Vai trò',
        type: 'select',
        options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
            { label: 'Manager', value: 'manager' },
        ],
    },
    {
        id: 'status',
        label: 'Trạng thái',
        type: 'select',
        options: [
            { label: 'Hoạt động', value: 'active' },
            { label: 'Không hoạt động', value: 'inactive' },
        ],
    },
    {
        id: 'createdAt',
        label: 'Ngày tạo',
        type: 'date-range',
    },
];

<DataTable
    columns={columns}
    data={data}
    tableId="users-table"
    filterDefinitions={filterDefinitions}
    // ... other props
/>;
```

### 3. Table với Custom Cell Renderers

```tsx
const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'avatar',
        header: 'Avatar',
        cell: ({ row }) => (
            <Avatar className="h-8 w-8">
                <AvatarImage src={row.getValue('avatar')} />
                <AvatarFallback>
                    {row.getValue('name')?.charAt(0)}
                </AvatarFallback>
            </Avatar>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'h-2 w-2 rounded-full',
                            status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        )}
                    />
                    <span className="capitalize">{status}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'lastLogin',
        header: 'Đăng nhập cuối',
        cell: ({ row }) => {
            const date = row.getValue('lastLogin') as Date;
            return date ? format(date, 'dd/MM/yyyy HH:mm') : 'Chưa đăng nhập';
        },
    },
];
```

## 🔥 Tính năng nâng cao

### 1. Pin Columns (Ghim cột)

**Cách 1: Sử dụng prop `initialColumnPinning`**

```tsx
<DataTable
    columns={columns}
    data={data}
    tableId="my-table"
    initialColumnPinning={{
        left: ['select', 'id'], // Ghim sang trái
        right: ['actions'], // Ghim sang phải
    }}
    // ... other props
/>
```

**Cách 2: Sử dụng column meta**

```tsx
const columns: ColumnDef<User>[] = [
    {
        id: 'select',
        header: 'Select',
        cell: ({ row }) => <Checkbox />,
        meta: { pin: 'left' }, // Ghim sang trái
    },
    {
        accessorKey: 'name',
        header: 'Tên',
        // Không có meta.pin = cột bình thường
    },
    {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => <Button>Sửa</Button>,
        meta: { pin: 'right' }, // Ghim sang phải
    },
];
```

### 2. Server-side Operations

```tsx
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    total: 0,
});
const [sorting, setSorting] = useState('');
const [filters, setFilters] = useState<SearchCondition[]>([]);
const [searchTerm, setSearchTerm] = useState('');

// Fetch data khi có thay đổi
const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
        const response = await api.getUsers({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            sort: sorting,
            filters: filters,
            search: searchTerm,
        });

        setUsers(response.data);
        setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        setLoading(false);
    }
}, [pagination.pageIndex, pagination.pageSize, sorting, filters, searchTerm]);

useEffect(() => {
    fetchUsers();
}, [fetchUsers]);

return (
    <DataTable
        columns={columns}
        data={users}
        tableId="users-table"
        loading={loading}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={pagination.total}
        currentSorting={sorting}
        onPaginationChange={(pageIndex, pageSize) => {
            setPagination((prev) => ({ ...prev, pageIndex, pageSize }));
        }}
        onSortingChange={setSorting}
        onFilterChange={setFilters}
        onSearchChange={setSearchTerm}
    />
);
```

### 3. Custom Styling

```tsx
// Custom column styles
const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Tên',
        cell: ({ row }) => (
            <div className="font-medium text-blue-600">
                {row.getValue('name')}
            </div>
        ),
        // Custom header styling
        meta: {
            headerClassName: 'bg-blue-50 text-blue-900',
        },
    },
];

// Custom table wrapper
<div className="rounded-lg border border-gray-200 overflow-hidden">
    <DataTable
        columns={columns}
        data={data}
        tableId="styled-table"
        // ... other props
    />
</div>;
```

## 🎨 Customization

### Theme Customization

Component sử dụng Tailwind CSS classes và hỗ trợ dark mode:

```css
/* Custom styles trong CSS */
.data-table-container {
    @apply bg-white dark:bg-gray-900;
}

.data-table-header {
    @apply bg-gray-50 dark:bg-gray-800;
}

.data-table-row:hover {
    @apply bg-gray-50 dark:bg-gray-800;
}
```

### Column Resizing (Tùy chỉnh)

```tsx
const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Tên',
        size: 200, // Độ rộng mặc định
        minSize: 100, // Độ rộng tối thiểu
        maxSize: 400, // Độ rộng tối đa
    },
];
```

## 📚 API Reference

### Column Definition Extended

```tsx
interface CustomColumnDef<TData, TValue> extends ColumnDef<TData, TValue> {
    meta?: {
        pin?: 'left' | 'right'; // Ghim cột
        headerClassName?: string; // CSS class cho header
        cellClassName?: string; // CSS class cho cell
        sortable?: boolean; // Có thể sắp xếp
        filterable?: boolean; // Có thể lọc
        exportable?: boolean; // Có thể export
    };
}
```

### Filter Definition

```tsx
interface FilterDefinition {
    id: string; // ID của filter
    label: string; // Label hiển thị
    type: 'text' | 'select' | 'date-range' | 'number-range';
    options?: FilterOption[]; // Options cho select
    placeholder?: string; // Placeholder text
    defaultValue?: any; // Giá trị mặc định
}

interface FilterOption {
    label: string;
    value: string | number;
}
```

### Search Condition

```tsx
interface SearchCondition {
    field: string; // Tên field
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
    value: any; // Giá trị tìm kiếm
}
```

## 🔍 Troubleshooting

### Vấn đề thường gặp:

**1. Table không hiển thị dữ liệu**

```tsx
// Đảm bảo data không rỗng và có đúng kiểu
console.log('Data:', data);
console.log('Columns:', columns);

// Kiểm tra accessorKey matches với data fields
const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name', // Phải match với data.name
        header: 'Tên',
    },
];
```

**2. Sorting không hoạt động**

```tsx
// Đảm bảo enableSorting=true và implement onSortingChange
<DataTable
    enableSorting={true}
    onSortingChange={(sorting) => {
        console.log('New sorting:', sorting);
        // Gọi API với sorting mới
    }}
/>
```

**3. Pinning không hoạt động**

```tsx
// Clear localStorage để reset table state
localStorage.removeItem('table-state-your-table-id');

// Hoặc đặt tableId khác
<DataTable tableId="new-unique-id" />;
```

**4. Performance issues với large datasets**

```tsx
// Sử dụng React.memo cho custom cells
const UserCell = React.memo(({ row }) => <div>{row.getValue('name')}</div>);

// Implement virtualization cho large tables
// (cần additional setup)
```

**5. Export không hoạt động**

```tsx
// Đảm bảo có data và columns
// Check browser console cho errors
// Verify file download permissions
```

### Debug Tips:

```tsx
// Enable debug mode
<DataTable
    // ... props
    // Thêm logging để debug
    onPaginationChange={(pageIndex, pageSize) => {
        console.log('Pagination:', { pageIndex, pageSize });
    }}
    onSortingChange={(sorting) => {
        console.log('Sorting:', sorting);
    }}
    onFilterChange={(filters) => {
        console.log('Filters:', filters);
    }}
/>
```

## 🤝 Đóng góp

Để đóng góp vào component này:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request
5. Cập nhật documentation

## 📄 License

Component này được sử dụng nội bộ trong project.

---

**Happy coding! 🚀**

_Nếu có thắc mắc hoặc gặp vấn đề, vui lòng tạo issue hoặc liên hệ team development._
