'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Clock,
  FileText,
  Calculator,
  TrendingDown,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';

import {
  usePendingShiftLeaveRequests,
  useApproveRejectShiftLeaveRequest,
  useAllShiftLeaveRequests,
  useAddShiftLeaveForEmployee,
  useUpdateShiftLeaveBalance,
  useBranchShiftLeaveBalances,
  useLowBalanceEmployees,
  type ShiftLeaveRequestDto,
  type ShiftLeaveBalanceDto,
} from '@/api/v1/shift-leave-management';
import { useShifts } from '@/api/v1/shifts';
import { useUsers } from '@/api/v1/users';
import { DataTable } from '@/components/common/Table/DataTable';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProtectedRoute } from '@/components/protected-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { AddLeaveForEmployeeModal } from '@/features/scheduling/components/shift-leave/AddLeaveForEmployeeModal';
import { ApproveRejectModal } from '@/features/scheduling/components/shift-leave/ApproveRejectModal';
import {
  balanceColumns,
  lowBalanceColumns,
} from '@/features/scheduling/components/shift-leave/balance-columns';
import {
  pendingShiftLeaveColumns,
  allShiftLeaveColumns,
} from '@/features/scheduling/components/shift-leave/columns';
import { UpdateLeaveBalanceModal } from '@/features/scheduling/components/shift-leave/UpdateLeaveBalanceModal';
import { Role } from '@/lib/rbac';
import { useCustomToast } from '@/lib/show-toast';

export function ShiftLeaveManagement() {
  const { user } = useAuth();
  const { success, error } = useCustomToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const branchId = user?.branch?.id || 0;

  // API hooks
  const { data: employeesData } = useUsers({
    branchId,
    isEmployee: true,
    size: 1000,
  });
  const { data: shiftsData } = useShifts(branchId);
  const { data: pendingRequests, isLoading: isLoadingPending } =
    usePendingShiftLeaveRequests(branchId);
  const { data: allRequests, isLoading: isLoadingAll } =
    useAllShiftLeaveRequests(branchId, currentYear);
  const { data: branchBalances, isLoading: isLoadingBalances } =
    useBranchShiftLeaveBalances(branchId, currentYear);
  const { data: lowBalanceEmployees, isLoading: isLoadingLowBalance } =
    useLowBalanceEmployees(branchId, currentYear, 5);

  const approveRejectMutation = useApproveRejectShiftLeaveRequest();
  const addLeaveMutation = useAddShiftLeaveForEmployee();
  const updateBalanceMutation = useUpdateShiftLeaveBalance();

  // State variables
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isAddLeaveDialogOpen, setIsAddLeaveDialogOpen] = useState(false);
  const [isUpdateBalanceDialogOpen, setIsUpdateBalanceDialogOpen] =
    useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ShiftLeaveRequestDto | null>(null);
  const [selectedEmployee, setSelectedEmployee] =
    useState<ShiftLeaveBalanceDto | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED'
  );

  // Data processing
  const shifts = shiftsData || [];
  const employees = employeesData?.data || [];
  const pending = pendingRequests || [];
  const all = allRequests || [];
  const balances = branchBalances || [];
  const lowBalance = lowBalanceEmployees || [];

  // Handle approve/reject
  const handleApproveReject = async (managerNote: string) => {
    if (!selectedRequest) return;

    try {
      await approveRejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        data: {
          requestStatus: approvalStatus,
          managerNote,
        },
      });

      success(
        'Success',
        `Request ${approvalStatus.toLowerCase()} successfully`
      );
      setIsApproveDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['pending-shift-leave-requests'],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-shift-leave-requests'],
      });
    } catch (err: any) {
      error(
        'Error',
        err?.response?.data?.message || 'Failed to update request'
      );
    }
  };

  // Handle add leave for employee
  const handleAddLeave = async (data: {
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    shiftIds: number[];
  }) => {
    try {
      await addLeaveMutation.mutateAsync(data);

      success('Success', 'Leave added for employee successfully');
      setIsAddLeaveDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['all-shift-leave-requests'],
      });
      queryClient.invalidateQueries({
        queryKey: ['branch-shift-leave-balances'],
      });
    } catch (err: any) {
      error('Error', err?.response?.data?.message || 'Failed to add leave');
    }
  };

  // Handle update balance
  const handleUpdateBalance = async (data: {
    year: number;
    bonusShifts: number;
    reason: string;
  }) => {
    if (!selectedEmployee) return;

    try {
      await updateBalanceMutation.mutateAsync({
        userId: selectedEmployee.user.id,
        data,
      });

      success('Success', 'Balance updated successfully');
      setIsUpdateBalanceDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ['branch-shift-leave-balances'],
      });
      queryClient.invalidateQueries({
        queryKey: ['low-balance-employees'],
      });
    } catch (err: any) {
      error(
        'Error',
        err?.response?.data?.message || 'Failed to update balance'
      );
    }
  };

  // Handle view details
  const handleViewDetails = (request: ShiftLeaveRequestDto) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  // Handle row click
  const handleRowClick = (request: ShiftLeaveRequestDto) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format time helper
  const formatTime = (time: any) => {
    if (typeof time === 'string') return time;
    if (
      time &&
      typeof time === 'object' &&
      time.hour !== undefined &&
      time.minute !== undefined
    ) {
      return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    return time?.toString() || '';
  };

  // Column actions for DataTable
  const pendingColumnActions = {
    onViewDetails: handleViewDetails,
    onApprove: (request: ShiftLeaveRequestDto) => {
      setSelectedRequest(request);
      setApprovalStatus('APPROVED');
      setIsApproveDialogOpen(true);
    },
    onReject: (request: ShiftLeaveRequestDto) => {
      setSelectedRequest(request);
      setApprovalStatus('REJECTED');
      setIsApproveDialogOpen(true);
    },
  };

  const allColumnActions = {
    onViewDetails: handleViewDetails,
  };

  const balanceColumnActions = {
    onUpdateBalance: (balance: ShiftLeaveBalanceDto) => {
      setSelectedEmployee(balance);
      setIsUpdateBalanceDialogOpen(true);
    },
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageTitle
        icon={FileText}
        title="Shift Leave Management"
        left={
          <Button
            onClick={() => setIsAddLeaveDialogOpen(true)}
            className="gap-2 w-full sm:w-auto justify-center"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Leave for Employee</span>
            <span className="sm:hidden">Add Leave</span>
          </Button>
        }
      />

      <Tabs defaultValue="pending" className="space-y-4 lg:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 min-w-max">
            <TabsTrigger
              value="pending"
              className="text-sm whitespace-nowrap px-3 py-2"
            >
              <span className="hidden sm:inline">Pending Requests</span>
              <span className="sm:hidden">Pending</span>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-sm whitespace-nowrap px-3 py-2"
            >
              <span className="hidden sm:inline">All Requests</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger
              value="balances"
              className="text-sm whitespace-nowrap px-3 py-2"
            >
              <span className="hidden sm:inline">Balance Management</span>
              <span className="sm:hidden">Balance</span>
            </TabsTrigger>
            <TabsTrigger
              value="low-balance"
              className="text-sm whitespace-nowrap px-3 py-2"
            >
              <span className="hidden sm:inline">Low Balance Employees</span>
              <span className="sm:hidden">Low Balance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">
                  Pending Shift Leave Requests
                </span>
                <span className="sm:hidden">Pending Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <DataTable
                columns={pendingShiftLeaveColumns(pendingColumnActions)}
                data={pending}
                tableId="pending-shift-leave-requests"
                pageIndex={0}
                pageSize={10}
                total={pending.length}
                onPaginationChange={() => {}}
                onSortingChange={() => {}}
                onFilterChange={() => {}}
                onSearchChange={() => {}}
                onClickRow={handleRowClick}
                enableSearch={true}
                enableColumnVisibility={true}
                enableSorting={true}
                enablePagination={true}
                enableExport={true}
                loading={isLoadingPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">
                  All Shift Leave Requests
                </span>
                <span className="sm:hidden">All Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <DataTable
                columns={allShiftLeaveColumns(allColumnActions)}
                data={all}
                tableId="all-shift-leave-requests"
                pageIndex={0}
                pageSize={10}
                total={all.length}
                onPaginationChange={() => {}}
                onSortingChange={() => {}}
                onFilterChange={() => {}}
                onSearchChange={() => {}}
                onClickRow={handleRowClick}
                enableSearch={true}
                enableColumnVisibility={true}
                enableSorting={true}
                enablePagination={true}
                enableExport={true}
                loading={isLoadingAll}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Calculator className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">
                  Branch Shift Leave Balances
                </span>
                <span className="sm:hidden">Balances</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <DataTable
                columns={balanceColumns(balanceColumnActions)}
                data={balances}
                tableId="balance-management"
                pageIndex={0}
                pageSize={10}
                total={balances.length}
                onPaginationChange={() => {}}
                onSortingChange={() => {}}
                onFilterChange={() => {}}
                onSearchChange={() => {}}
                enableSearch={true}
                enableColumnVisibility={true}
                enableSorting={true}
                enablePagination={true}
                enableExport={true}
                loading={isLoadingBalances}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-balance" className="space-y-4">
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">Low Balance Employees</span>
                <span className="sm:hidden">Low Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <DataTable
                columns={lowBalanceColumns(balanceColumnActions)}
                data={lowBalance}
                tableId="low-balance-employees"
                pageIndex={0}
                pageSize={10}
                total={lowBalance.length}
                onPaginationChange={() => {}}
                onSortingChange={() => {}}
                onFilterChange={() => {}}
                onSearchChange={() => {}}
                enableSearch={true}
                enableColumnVisibility={true}
                enableSorting={true}
                enablePagination={true}
                enableExport={true}
                loading={isLoadingLowBalance}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto m-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">
              Shift Leave Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Employee</Label>
                  <p className="break-words">
                    {selectedRequest.employee.fullName}
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {selectedRequest.employee.email}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      className={getStatusColor(selectedRequest.requestStatus)}
                    >
                      {selectedRequest.requestStatus === 'PENDING'
                        ? 'Pending'
                        : selectedRequest.requestStatus === 'APPROVED'
                          ? 'Approved'
                          : 'Rejected'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Period</Label>
                  <p className="break-words">
                    {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy')}{' '}
                    - {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Affected Shifts</Label>
                  <p>{selectedRequest.affectedShiftsCount} shifts</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Reason</Label>
                <p className="break-words">{selectedRequest.reason}</p>
              </div>

              <div>
                <Label className="font-medium">Requested Shifts</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRequest.requestedShifts.map((shift) => (
                    <Badge
                      key={shift.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {shift.name} ({formatTime(shift.startTime)} -{' '}
                      {formatTime(shift.endTime)})
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRequest.managerNote && (
                <div>
                  <Label className="font-medium">Manager Note</Label>
                  <p className="break-words">{selectedRequest.managerNote}</p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div>
                  <Label className="font-medium">Approved By</Label>
                  <p className="break-words">
                    {selectedRequest.approvedBy.fullName}
                  </p>
                  {selectedRequest.approvedAt && (
                    <p className="text-sm text-gray-600">
                      Approved on:{' '}
                      {format(
                        new Date(selectedRequest.approvedAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created:{' '}
                    {format(
                      new Date(selectedRequest.createdAt),
                      'dd/MM/yyyy HH:mm'
                    )}
                  </span>
                </div>
                {selectedRequest.isManagerAdded && (
                  <Badge variant="outline" className="w-fit">
                    Manager Added
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Components */}
      <ApproveRejectModal
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        request={selectedRequest}
        approvalStatus={approvalStatus}
        onSubmit={handleApproveReject}
        isLoading={approveRejectMutation.isPending}
      />

      <AddLeaveForEmployeeModal
        open={isAddLeaveDialogOpen}
        onOpenChange={setIsAddLeaveDialogOpen}
        employees={employees}
        shifts={shifts}
        onSubmit={handleAddLeave}
        isLoading={addLeaveMutation.isPending}
      />

      <UpdateLeaveBalanceModal
        open={isUpdateBalanceDialogOpen}
        onOpenChange={setIsUpdateBalanceDialogOpen}
        selectedEmployee={selectedEmployee}
        currentYear={currentYear}
        onSubmit={handleUpdateBalance}
        isLoading={updateBalanceMutation.isPending}
      />
    </div>
  );
}

export default function ShiftLeaveManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.MANAGER]}>
      <ShiftLeaveManagement />
    </ProtectedRoute>
  );
}
