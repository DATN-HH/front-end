import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Edit,
  Trash,
  Clock,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
} from 'lucide-react';

import { ShiftResponseDto } from '@/api/v1/shifts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface ShiftTableColumnsProps {
  onEdit: (shift: ShiftResponseDto) => void;
  onDelete: (shift: ShiftResponseDto) => void;
}

export const ShiftTableColumns = ({
  onEdit,
  onDelete,
}: ShiftTableColumnsProps): ColumnDef<ShiftResponseDto>[] => [
  {
    accessorKey: 'name',
    header: 'Shift Name',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-[140px]">
        <div className="p-1.5 rounded-full bg-primary/10">
          <Clock className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-semibold text-foreground">
          {row.original.name}
        </span>
      </div>
    ),
    meta: {
      pin: 'left', // Pin column to left
    },
  },
  {
    id: 'timeRange',
    header: 'Time Range',
    enableSorting: false,
    cell: ({ row }) => {
      const formatTime = (time: any) => {
        if (typeof time === 'string') {
          return time.substring(0, 5);
        }
        if (
          time &&
          typeof time === 'object' &&
          time.hour !== undefined &&
          time.minute !== undefined
        ) {
          return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
        }
        return '00:00';
      };

      const startTime = formatTime(row.original.startTime);
      const endTime = formatTime(row.original.endTime);

      return (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="p-1.5 rounded-full bg-secondary/50">
            <Calendar className="h-3.5 w-3.5 text-secondary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {startTime} - {endTime}
            </span>
            <span className="text-xs text-muted-foreground">
              {calculateDuration(startTime, endTime)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'weekDays',
    header: 'Working Days',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1.5 min-w-[200px]">
        {row.original.weekDays.map((day, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs px-2 py-0.5 bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20"
          >
            {getDayAbbreviation(day)}
          </Badge>
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({row.original.weekDays.length} days)
        </span>
      </div>
    ),
  },
  {
    id: 'requirements',
    header: 'Staff Requirements',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5 min-w-[180px]">
        {row.original.requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium border border-border"
          >
            <Users className="h-3 w-3" />
            <span>{req.role}</span>
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs font-bold">
              {req.quantity}
            </span>
          </div>
        ))}
        {row.original.requirements.length === 0 && (
          <span className="text-xs text-muted-foreground italic">
            No requirements
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'branchName',
    header: 'Branch',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="p-1.5 rounded-full bg-gold-100">
          <MapPin className="h-3.5 w-3.5 text-gold-600" />
        </div>
        <span className="text-sm font-medium text-foreground">
          {row.original.branchName || 'Unknown Branch'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isActive = status === 'ACTIVE';

      return (
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : 'bg-muted'}`}
          >
            <CheckCircle
              className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={
              isActive
                ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
            }
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col text-sm min-w-[100px]">
        <span className="font-medium text-foreground">
          {dayjs(row.original.createdAt).format('DD/MM/YYYY')}
        </span>
        <span className="text-xs text-muted-foreground">
          {dayjs(row.original.createdAt).format('HH:mm')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col text-sm min-w-[100px]">
        <span className="font-medium text-foreground">
          {dayjs(row.original.updatedAt).format('DD/MM/YYYY')}
        </span>
        <span className="text-xs text-muted-foreground">
          {dayjs(row.original.updatedAt).format('HH:mm')}
          <span className="ml-1 text-muted-foreground/70">
            ({dayjs(row.original.updatedAt).fromNow()})
          </span>
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5 min-w-[80px]">
          <Button
            className="primary-button"
            onClick={() => onEdit(row.original)}
            title="Edit shift"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-red-500"
            onClick={() => onDelete(row.original)}
            title="Delete shift"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    meta: {
      pin: 'right', // Pin column to right
    },
  },
];

// Helper functions
const getDayAbbreviation = (day: string): string => {
  const dayMap: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
  };
  return dayMap[day] || day.substring(0, 3);
};

const calculateDuration = (startTime: string, endTime: string): string => {
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    // Handle overnight shifts
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  } catch (error) {
    return 'N/A';
  }
};
