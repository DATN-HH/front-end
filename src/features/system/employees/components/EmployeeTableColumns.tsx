import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Edit, MoreHorizontal, Trash, Calendar, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { UserResponseDto } from '@/api/v1/users';

interface EmployeeTableColumnsProps {
    onEdit: (employee: UserResponseDto) => void;
    onDelete: (employee: UserResponseDto) => void;
    onManageUnavailability?: (employee: UserResponseDto) => void;
}

export const EmployeeTableColumns = ({
    onEdit,
    onDelete,
    onManageUnavailability,
}: EmployeeTableColumnsProps): ColumnDef<UserResponseDto>[] => [
        {
            accessorKey: 'fullName',
            header: 'Employee',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage
                            src={
                                row.original.gender === 'MALE'
                                    ? 'https://cdn1.iconfinder.com/data/icons/user-pictures/101/malecostume-512.png'
                                    : 'https://png.pngtree.com/png-clipart/20241117/original/pngtree-business-women-avatar-png-image_17163554.png'
                            }
                            alt={row.original.fullName}
                        />
                    </Avatar>
                    <span>{row.original.fullName}</span>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            id: 'roles',
            header: 'Roles',
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {row.original.isFullRole ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500 text-white">
                                <CheckCircle className="w-3 h-3" />
                                <span>Full Roles</span>
                            </div>
                        ) : (
                            row.original.userRoles.map((userRole, index) => (
                                <div
                                    key={index}
                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500 text-white"
                                >
                                    {userRole.role.name}
                                </div>
                            ))
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'birthdate',
            header: 'Birthdate',
            cell: ({ row }) => (
                <div>{dayjs(row.original.birthdate).format('DD/MM/YYYY')}</div>
            ),
        },
        {
            accessorKey: 'gender',
            header: 'Gender',
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone',
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: ({ row }) => (
                <div>
                    {dayjs(row.original.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </div>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated At',
            cell: ({ row }) => (
                <div>
                    {dayjs(row.original.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${row.getValue('status') === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {row.getValue('status')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onEdit(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
                );
            },
        },
    ]; 