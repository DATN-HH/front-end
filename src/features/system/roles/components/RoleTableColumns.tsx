import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';

import { RoleResponseDto } from '@/api/v1/auth';
import { Button } from '@/components/ui/button';

interface RoleTableColumnsProps {
  onEdit: (role: RoleResponseDto) => void;
  onDelete: (role: RoleResponseDto) => void;
}

export const RoleTableColumns = ({
  onEdit,
  onDelete,
}: RoleTableColumnsProps): ColumnDef<RoleResponseDto>[] => [
  {
    accessorKey: 'hexColor',
    header: 'Color',
    cell: ({ row }) => (
      <div
        className="w-6 h-6 rounded-full"
        style={{
          backgroundColor: row.getValue('hexColor'),
        }}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.getValue('status') === 'ACTIVE'
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
          <Button size="sm" onClick={() => onEdit(row.original)}>
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
