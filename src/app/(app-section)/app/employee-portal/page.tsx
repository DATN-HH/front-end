// 'use client';

// import { useState, useMemo, useCallback, useEffect } from 'react';
// import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
// import { Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { PageTitle } from '@/components/layouts/app-section/page-title';
// import { WeekCalendar } from '@/features/employee-portal/components/WeekCalendar';
// import { TimeOffRequests } from '@/features/employee-portal/components/TimeOffRequests';
// import { ShiftRequests } from '@/features/employee-portal/components/ShiftRequests';
// import { TimeOffDialog } from '@/features/employee-portal/components/TimeOffDialog';
// import { ShiftRequestDialog } from '@/features/employee-portal/components/ShiftRequestDialog';
// import { useStaffShifts, StaffShiftResponseDto } from '@/api/v1/staff-shifts';
// import { useAuth } from '@/contexts/auth-context';
// import { ShiftRequestType, RequestStatus } from '@/api/v1';
// import { UserDtoResponse } from '@/api/v1/auth';
// import { MAX_SIZE_PER_PAGE } from '@/lib/constants';
// import { useCustomToast } from '@/lib/show-toast';
// import { useQueryClient } from '@tanstack/react-query';

// // Mock branch data
// const mockBranch = {
//     id: 1,
//     name: 'Downtown Branch',
//     address: '',
//     phone: '',
//     createdAt: '',
//     createdBy: 1,
//     updatedAt: '',
//     updatedBy: 1,
//     status: 'ACTIVE' as const,
//     createdUsername: '',
//     updatedUsername: '',
// };

// // Mock manager data
// const mockManager: UserDtoResponse = {
//     id: 2,
//     email: 'manager@example.com',
//     username: 'manager',
//     fullName: 'Branch Manager',
//     birthdate: '1985-01-01',
//     gender: 'MALE',
//     phoneNumber: '0987654321',
//     isFullRole: true,
//     userRoles: [
//         {
//             id: 2,
//             userId: 2,
//             roleId: 2,
//             role: {
//                 id: 2,
//                 name: 'MANAGER',
//                 description: '',
//                 hexColor: '',
//                 rolePermissions: [],
//                 roleScreens: [],
//                 createdAt: '',
//                 createdBy: 1,
//                 updatedAt: '',
//                 updatedBy: 1,
//                 status: 'ACTIVE',
//                 createdUsername: '',
//                 updatedUsername: '',
//             },
//         },
//     ],
//     branch: {
//         ...mockBranch,
//         manager: null as any, // Will be set after mockManager is fully defined
//     },
//     displayName: 'Branch Manager',
//     createdAt: '',
//     createdBy: 1,
//     updatedAt: '',
//     updatedBy: 1,
//     status: 'ACTIVE',
//     createdUsername: '',
//     updatedUsername: '',
// };

// // Set manager reference
// mockManager.branch.manager = mockManager;

// // Mock user data
// const mockUser: UserDtoResponse = {
//     id: 1,
//     email: 'john.doe@example.com',
//     username: 'john.doe',
//     fullName: 'John Doe',
//     birthdate: '1990-01-01',
//     gender: 'MALE',
//     phoneNumber: '1234567890',
//     isFullRole: false,
//     userRoles: [
//         {
//             id: 1,
//             userId: 1,
//             roleId: 1,
//             role: {
//                 id: 1,
//                 name: 'WAITER',
//                 description: '',
//                 hexColor: '',
//                 rolePermissions: [],
//                 roleScreens: [],
//                 createdAt: '',
//                 createdBy: 1,
//                 updatedAt: '',
//                 updatedBy: 1,
//                 status: 'ACTIVE',
//                 createdUsername: '',
//                 updatedUsername: '',
//             },
//         },
//     ],
//     branch: {
//         ...mockBranch,
//         manager: mockManager,
//     },
//     displayName: 'John Doe',
//     createdAt: '',
//     createdBy: 1,
//     updatedAt: '',
//     updatedBy: 1,
//     status: 'ACTIVE',
//     createdUsername: '',
//     updatedUsername: '',
// };

// // Mock shift exchange requests
// const mockShiftRequests: ShiftRequestResponseDto[] = [
//     {
//         id: 1,
//         targetShiftId: 2,
//         type: 'EXCHANGE' as ShiftRequestType,
//         requestStatus: 'PENDING' as RequestStatus,
//         reason: 'Family event',
//         createdAt: '2025-05-21T10:15:00Z',
//         staff: mockUser,
//         targetShift: {
//             id: 2,
//             date: '2025-05-23',
//             note: '',
//             shiftStatus: 'PUBLISHED',
//             staff: mockUser,
//             shift: {
//                 id: 204,
//                 name: 'Lunch Shift',
//                 startTime: { hour: 12, minute: 0, second: 0, nano: 0 },
//                 endTime: { hour: 20, minute: 0, second: 0, nano: 0 },
//                 weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
//                 branchId: 1,
//                 branchName: 'Downtown Branch',
//                 requirements: [{ id: 1, role: 'WAITER', quantity: 2 }],
//                 createdAt: '2025-05-21T10:15:00Z',
//                 createdBy: 1,
//                 updatedAt: '2025-05-21T10:15:00Z',
//                 updatedBy: 1,
//                 status: 'ACTIVE',
//                 createdUsername: 'admin',
//                 updatedUsername: 'admin',
//             },
//             createdAt: '2025-05-21T10:15:00Z',
//             createdBy: 1,
//             updatedAt: '2025-05-21T10:15:00Z',
//             updatedBy: 1,
//             status: 'ACTIVE',
//             createdUsername: 'admin',
//             updatedUsername: 'admin',
//         },
//         createdBy: 1,
//         updatedAt: '2025-05-21T10:15:00Z',
//         updatedBy: 1,
//         status: 'ACTIVE',
//         createdUsername: 'admin',
//         updatedUsername: 'admin',
//     },
// ];

// export default function EmployeePortalPage() {
//     const { user } = useAuth();
//     const queryClient = useQueryClient();
//     const { error: toastError, success } = useCustomToast();
//     const [date, setDate] = useState<Date>(new Date());
//     const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
//     const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
//     const [shiftRequests, setShiftRequests] = useState<ShiftRequestResponseDto[]>(mockShiftRequests);
//     const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
//     const [isShiftRequestDialogOpen, setIsShiftRequestDialogOpen] = useState(false);
//     const [selectedShift, setSelectedShift] = useState<StaffShiftResponseDto | null>(null);

//     // Query params for staff shifts
//     const queryParams = useMemo(() => ({
//         startDate: startDate.toISOString().split('T')[0],
//         endDate: endDate.toISOString().split('T')[0],
//         staffId: user?.id,
//         size: MAX_SIZE_PER_PAGE,
//     }), [startDate, endDate, user?.id]);

//     // Query params for staff unavailability
//     const staffUnavailabilityParams = useMemo(() => ({
//         startDate: startDate.toISOString().split('T')[0],
//         endDate: endDate.toISOString().split('T')[0],
//         branchId: user?.branch.id,
//         staffId: user?.id,
//         size: MAX_SIZE_PER_PAGE,
//     }), [startDate, endDate, user?.branch.id, user?.id]);

//     // Fetch staff shifts
//     const { data: staffShiftsData, isLoading: isStaffShiftsLoading } = useStaffShifts(queryParams);

//     // Fetch staff unavailability
//     const { data: staffUnavailabilityData, isLoading: isStaffUnavailabilityLoading } = useStaffUnavailability(staffUnavailabilityParams);

//     const [timeOffRequests, setTimeOffRequests] = useState<StaffUnavailabilityResponseDto[]>([]);

//     useEffect(() => {
//         if (staffUnavailabilityData?.data) {
//             setTimeOffRequests(staffUnavailabilityData.data);
//         } else {
//             setTimeOffRequests([]);
//         }
//     }, [staffUnavailabilityData, staffUnavailabilityParams, isStaffUnavailabilityLoading]);

//     // New time-off request form state
//     const [newTimeOff, setNewTimeOff] = useState({
//         startDate: new Date(),
//         startTime: '09:00',
//         endDate: new Date(),
//         endTime: '17:00',
//         reason: '',
//     });

//     // New shift request form state
//     const [newShiftRequest, setNewShiftRequest] = useState({
//         type: 'EXCHANGE' as ShiftRequestType,
//         reason: '',
//     });

//     // Create time-off request mutation
//     const createTimeOffMutation = useCreateStaffUnavailability();

//     // Navigate to previous/next week
//     const navigatePrevious = useCallback(() => {
//         const newDate = addDays(date, -7);
//         setDate(newDate);
//         setStartDate(startOfWeek(newDate));
//         setEndDate(endOfWeek(newDate));
//     }, [date]);

//     const navigateNext = useCallback(() => {
//         const newDate = addDays(date, 7);
//         setDate(newDate);
//         setStartDate(startOfWeek(newDate));
//         setEndDate(endOfWeek(newDate));
//     }, [date]);

//     // Handle time-off request submission
//     const handleTimeOffSubmit = () => {
//         // Create ISO date strings
//         const startDateTime = `${format(newTimeOff.startDate, 'yyyy-MM-dd')}T${newTimeOff.startTime}:00Z`;
//         const endDateTime = `${format(newTimeOff.endDate, 'yyyy-MM-dd')}T${newTimeOff.endTime}:00Z`;

//         // Create request data
//         const requestData = {
//             startTime: startDateTime,
//             endTime: endDateTime,
//             reason: newTimeOff.reason,
//         };

//         createTimeOffMutation.mutate(requestData, {
//             onSuccess: () => {
//                 // Invalidate and refetch
//                 queryClient.invalidateQueries({ queryKey: ['staff-unavailability', staffUnavailabilityParams] });
//                 success('Success', 'Time-off request created successfully');
//                 // Reset form and close dialog
//                 setNewTimeOff({
//                     startDate: new Date(),
//                     startTime: '09:00',
//                     endDate: new Date(),
//                     endTime: '17:00',
//                     reason: '',
//                 });
//                 setIsTimeOffDialogOpen(false);
//             },
//             onError: (error: any) => {
//                 toastError(
//                     'Error',
//                     error?.response?.data?.message || 'Failed to create time-off request'
//                 );
//             },
//         });
//     };

//     // Handle shift request submission
//     const handleShiftRequestSubmit = () => {
//         if (!selectedShift || !user) return;

//         // Create new request
//         const newRequest: ShiftRequestResponseDto = {
//             id: Math.max(0, ...shiftRequests.map((r) => r.id)) + 1,
//             targetShiftId: selectedShift.id,
//             type: newShiftRequest.type,
//             requestStatus: 'PENDING' as RequestStatus,
//             reason: newShiftRequest.reason,
//             createdAt: new Date().toISOString(),
//             staff: user,
//             targetShift: selectedShift,
//             createdBy: user.id,
//             updatedAt: new Date().toISOString(),
//             updatedBy: user.id,
//             status: 'ACTIVE',
//             createdUsername: user.username,
//             updatedUsername: user.username,
//         };

//         // Add to state
//         setShiftRequests((prev) => [...prev, newRequest]);

//         // Reset form and close dialog
//         setNewShiftRequest({
//             type: 'EXCHANGE' as ShiftRequestType,
//             reason: '',
//         });
//         setSelectedShift(null);
//         setIsShiftRequestDialogOpen(false);
//     };

//     // Open shift request dialog
//     const openShiftRequestDialog = useCallback((shift: StaffShiftResponseDto) => {
//         setSelectedShift(shift);
//         setIsShiftRequestDialogOpen(true);
//     }, []);

//     // Open time-off request dialog
//     const openTimeOffRequestDialog = useCallback(() => {
//         setIsTimeOffDialogOpen(true);
//     }, []);

//     return (
//         <>
//             <div className="flex flex-col gap-6">
//                 <PageTitle
//                     icon={Users}
//                     title="Employee Portal"
//                     left={
//                         <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-2">
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={navigatePrevious}
//                                 >
//                                     <ChevronLeft className="h-4 w-4" />
//                                 </Button>
//                                 <span className="text-sm font-medium">
//                                     {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
//                                 </span>
//                                 <Button
//                                     variant="outline"
//                                     size="icon"
//                                     onClick={navigateNext}
//                                 >
//                                     <ChevronRight className="h-4 w-4" />
//                                 </Button>
//                             </div>

//                             <Button onClick={openTimeOffRequestDialog}>
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Request Time Off
//                             </Button>
//                         </div>
//                     }
//                 />

//                 <WeekCalendar
//                     shifts={staffShiftsData?.data || []}
//                     onPreviousWeek={navigatePrevious}
//                     onNextWeek={navigateNext}
//                     onShiftClick={openShiftRequestDialog}
//                     isLoading={isStaffShiftsLoading}
//                     startDate={startDate}
//                     endDate={endDate}
//                 />

//                 <div className="grid gap-6 md:grid-cols-2">
//                     <TimeOffRequests
//                         requests={timeOffRequests}
//                         isLoading={isStaffUnavailabilityLoading}
//                         onCreateRequest={openTimeOffRequestDialog}
//                     />

//                     <ShiftRequests requests={shiftRequests} />
//                 </div>
//             </div>

//             <TimeOffDialog
//                 isOpen={isTimeOffDialogOpen}
//                 onClose={() => setIsTimeOffDialogOpen(false)}
//                 onSubmit={handleTimeOffSubmit}
//                 newTimeOff={newTimeOff}
//                 onTimeOffChange={(field: string, value: any) =>
//                     setNewTimeOff((prev) => ({ ...prev, [field]: value }))
//                 }
//                 isLoading={createTimeOffMutation.isPending}
//             />

//             <ShiftRequestDialog
//                 isOpen={isShiftRequestDialogOpen}
//                 onClose={() => setIsShiftRequestDialogOpen(false)}
//                 onSubmit={handleShiftRequestSubmit}
//                 selectedShift={selectedShift}
//                 newShiftRequest={newShiftRequest}
//                 onShiftRequestChange={(field, value) =>
//                     setNewShiftRequest((prev) => ({ ...prev, [field]: value }))
//                 }
//             />
//         </>
//     );
// }
