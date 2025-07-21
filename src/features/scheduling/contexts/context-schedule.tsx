import { endOfWeek, startOfWeek } from 'date-fns';
import dayjs from 'dayjs';
import { createContext, useState } from 'react';

import {
  useRoles,
  RoleResponseDto,
  useStaffShiftsGrouped,
  StaffShiftGroupedResponseDto,
} from '@/api/v1';
import {
  useScheduledShifts,
  useScheduledShiftsGrouped,
  ScheduledShiftResponseDto,
  ScheduledShiftGroupedResponseDto,
} from '@/api/v1/scheduled-shift';
import { useShifts, ShiftResponseDto } from '@/api/v1/shifts';
import { useAuth } from '@/contexts/auth-context';

export const ScheduleContext = createContext<{
  isCreateShiftDialogOpen: boolean;
  setIsCreateShiftDialogOpen: (isOpen: boolean) => void;
  isCreateOpenShiftDialogOpen: boolean;
  setIsCreateOpenShiftDialogOpen: (isOpen: boolean) => void;
  isAddShiftModalOpen: boolean;
  setIsAddShiftModalOpen: (isOpen: boolean) => void;
  isShiftInfoModalOpen: boolean;
  setIsShiftInfoModalOpen: (isOpen: boolean) => void;
  shiftInfoModalType: 'open-shift' | 'employee-shift' | null;
  setShiftInfoModalType: (type: 'open-shift' | 'employee-shift' | null) => void;
  selectedStaffName: string | null;
  setSelectedStaffName: (staffName: string | null) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  viewMode: 'daily' | 'weekly' | 'monthly';
  setViewMode: (mode: 'daily' | 'weekly' | 'monthly') => void;
  shifts: ShiftResponseDto[] | undefined;
  isLoadingShifts: boolean;
  scheduledShifts: ScheduledShiftResponseDto[] | undefined;
  isLoadingScheduledShifts: boolean;
  scheduledShiftsGrouped: ScheduledShiftGroupedResponseDto[] | undefined;
  isLoadingScheduledShiftsGrouped: boolean;
  roles: RoleResponseDto[] | undefined;
  isLoadingRoles: boolean;
  staffShiftsGrouped: StaffShiftGroupedResponseDto | undefined;
  isLoadingStaffShiftsGrouped: boolean;
}>({
  isCreateShiftDialogOpen: false,
  setIsCreateShiftDialogOpen: () => {},
  isCreateOpenShiftDialogOpen: false,
  setIsCreateOpenShiftDialogOpen: () => {},
  isAddShiftModalOpen: false,
  setIsAddShiftModalOpen: () => {},
  isShiftInfoModalOpen: false,
  setIsShiftInfoModalOpen: () => {},
  shiftInfoModalType: null,
  setShiftInfoModalType: () => {},
  selectedStaffName: null,
  setSelectedStaffName: () => {},
  selectedDate: new Date(),
  setSelectedDate: () => {},
  startDate: new Date(),
  setStartDate: () => {},
  endDate: new Date(),
  setEndDate: () => {},
  viewMode: 'weekly',
  setViewMode: () => {},
  shifts: [],
  isLoadingShifts: true,
  scheduledShifts: [],
  isLoadingScheduledShifts: true,
  scheduledShiftsGrouped: [],
  isLoadingScheduledShiftsGrouped: true,
  roles: [],
  isLoadingRoles: true,
  staffShiftsGrouped: undefined,
  isLoadingStaffShiftsGrouped: true,
});

export const ScheduleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [isCreateShiftDialogOpen, setIsCreateShiftDialogOpen] = useState(false);
  const [isCreateOpenShiftDialogOpen, setIsCreateOpenShiftDialogOpen] =
    useState(false);
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [isShiftInfoModalOpen, setIsShiftInfoModalOpen] = useState(false);
  const [shiftInfoModalType, setShiftInfoModalType] = useState<
    'open-shift' | 'employee-shift' | null
  >(null);
  const [selectedStaffName, setSelectedStaffName] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [endDate, setEndDate] = useState(
    endOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>(
    'weekly'
  );

  const { data: shifts, isLoading: isLoadingShifts } = useShifts(
    user?.branch?.id ?? 0
  );
  const { data: scheduledShifts, isLoading: isLoadingScheduledShifts } =
    useScheduledShifts({
      branchId: user?.branch?.id ?? 0,
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
    });
  const {
    data: scheduledShiftsGrouped,
    isLoading: isLoadingScheduledShiftsGrouped,
  } = useScheduledShiftsGrouped({
    branchId: user?.branch?.id ?? 0,
    startDate: dayjs(startDate).format('YYYY-MM-DD'),
    endDate: dayjs(endDate).format('YYYY-MM-DD'),
  });

  const { data: roles, isLoading: isLoadingRoles } = useRoles({});

  const { data: staffShiftsGrouped, isLoading: isLoadingStaffShiftsGrouped } =
    useStaffShiftsGrouped({
      branchId: user?.branch?.id ?? 0,
      startDate: dayjs(startDate).format('YYYY-MM-DD'),
      endDate: dayjs(endDate).format('YYYY-MM-DD'),
      size: 1000000,
    }); // ROLE -> STAFF NAME -> DATE -> SHIFTS

  return (
    <ScheduleContext.Provider
      value={{
        isCreateShiftDialogOpen,
        setIsCreateShiftDialogOpen,
        isCreateOpenShiftDialogOpen,
        setIsCreateOpenShiftDialogOpen,
        isAddShiftModalOpen,
        setIsAddShiftModalOpen,
        isShiftInfoModalOpen,
        setIsShiftInfoModalOpen,
        shiftInfoModalType,
        setShiftInfoModalType,
        selectedStaffName,
        setSelectedStaffName,
        selectedDate,
        setSelectedDate,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        viewMode,
        setViewMode,
        shifts,
        isLoadingShifts,
        scheduledShifts,
        isLoadingScheduledShifts,
        scheduledShiftsGrouped,
        isLoadingScheduledShiftsGrouped,
        roles: roles?.data,
        isLoadingRoles,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};
