'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { DataTable } from '@/components/common/Table/DataTable';
import {
    Clock,
    FileText,
    Eye,
    Check,
    X,
    Users,
    Calculator,
    TrendingDown,
    Calendar,
    Plus,
    UserPlus,
    Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { useUsers } from '@/api/v1/users';
import { useShifts } from '@/api/v1/shifts';
import { useCustomToast } from '@/lib/show-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Role } from '@/lib/rbac';
import { ProtectedRoute } from '@/components/protected-component';
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
    type ApproveRejectRequest,
    type ShiftLeaveRequestForEmployee,
    type UpdateShiftLeaveBalanceRequest
} from '@/api/v1/shift-leave-management';
import {
    pendingShiftLeaveColumns,
    allShiftLeaveColumns
} from './columns';
import {
    balanceColumns,
    lowBalanceColumns
} from './balance-columns';
import { ApproveRejectModal } from './ApproveRejectModal';
import { AddLeaveForEmployeeModal } from './AddLeaveForEmployeeModal';
import { UpdateLeaveBalanceModal } from './UpdateLeaveBalanceModal';
// import { ShiftLeaveDetailModal } from './ShiftLeaveDetailModal';

export function ShiftLeaveManagement() {
    const { user } = useAuth();
    const { success, error } = useCustomToast();
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    const branchId = user?.branch?.id || 0;

    // API hooks
    const { data: employeesData } = useUsers({ branchId, isEmployee: true, size: 1000 });
    const { data: shiftsData } = useShifts(branchId);
    const { data: pendingRequests, isLoading: isLoadingPending } = usePendingShiftLeaveRequests(branchId);
    const { data: allRequests, isLoading: isLoadingAll } = useAllShiftLeaveRequests(branchId, currentYear);
    const { data: branchBalances, isLoading: isLoadingBalances } = useBranchShiftLeaveBalances(branchId, currentYear);
    const { data: lowBalanceEmployees, isLoading: isLoadingLowBalance } = useLowBalanceEmployees(branchId, currentYear, 5);

    const approveRejectMutation = useApproveRejectShiftLeaveRequest();
    const addLeaveMutation = useAddShiftLeaveForEmployee();
    const updateBalanceMutation = useUpdateShiftLeaveBalance();

    // State variables
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isAddLeaveDialogOpen, setIsAddLeaveDialogOpen] = useState(false);
    const [isUpdateBalanceDialogOpen, setIsUpdateBalanceDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ShiftLeaveRequestDto | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<ShiftLeaveBalanceDto | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

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
                    managerNote: managerNote
                }
            });

            success('Success', `Request ${approvalStatus.toLowerCase()} successfully`);
            setIsApproveDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['pending-shift-leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['all-shift-leave-requests'] });
        } catch (err: any) {
            error('Error', err?.response?.data?.message || 'Failed to update request');
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
            queryClient.invalidateQueries({ queryKey: ['all-shift-leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['branch-shift-leave-balances'] });
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
                data: data
            });

            success('Success', 'Balance updated successfully');
            setIsUpdateBalanceDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['branch-shift-leave-balances'] });
            queryClient.invalidateQueries({ queryKey: ['low-balance-employees'] });
        } catch (err: any) {
            error('Error', err?.response?.data?.message || 'Failed to update balance');
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
        if (time && typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
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
        }
    };

    const allColumnActions = {
        onViewDetails: handleViewDetails
    };

    const balanceColumnActions = {
        onUpdateBalance: (balance: ShiftLeaveBalanceDto) => {
            setSelectedEmployee(balance);
            setIsUpdateBalanceDialogOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <PageTitle
                icon={FileText}
                title="Shift Leave Management"
                left={
                    <Button
                        onClick={() => setIsAddLeaveDialogOpen(true)}
                        className="gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Leave for Employee
                    </Button>
                }
            />

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="balances">Balance Management</TabsTrigger>
                    <TabsTrigger value="low-balance">Low Balance Employees</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Pending Shift Leave Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={pendingShiftLeaveColumns(pendingColumnActions)}
                                data={pending}
                                tableId="pending-shift-leave-requests"
                                pageIndex={0}
                                pageSize={10}
                                total={pending.length}
                                onPaginationChange={() => { }}
                                onSortingChange={() => { }}
                                onFilterChange={() => { }}
                                onSearchChange={() => { }}
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                All Shift Leave Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={allShiftLeaveColumns(allColumnActions)}
                                data={all}
                                tableId="all-shift-leave-requests"
                                pageIndex={0}
                                pageSize={10}
                                total={all.length}
                                onPaginationChange={() => { }}
                                onSortingChange={() => { }}
                                onFilterChange={() => { }}
                                onSearchChange={() => { }}
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Branch Shift Leave Balances
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={balanceColumns(balanceColumnActions)}
                                data={balances}
                                tableId="balance-management"
                                pageIndex={0}
                                pageSize={10}
                                total={balances.length}
                                onPaginationChange={() => { }}
                                onSortingChange={() => { }}
                                onFilterChange={() => { }}
                                onSearchChange={() => { }}
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                Low Balance Employees
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={lowBalanceColumns(balanceColumnActions)}
                                data={lowBalance}
                                tableId="low-balance-employees"
                                pageIndex={0}
                                pageSize={10}
                                total={lowBalance.length}
                                onPaginationChange={() => { }}
                                onSortingChange={() => { }}
                                onFilterChange={() => { }}
                                onSearchChange={() => { }}
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Shift Leave Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-medium">Employee</Label>
                                    <p>{selectedRequest.employee.fullName}</p>
                                    <p className="text-sm text-gray-600">{selectedRequest.employee.email}</p>
                                </div>
                                <div>
                                    <Label className="font-medium">Status</Label>
                                    <Badge className={getStatusColor(selectedRequest.requestStatus)}>
                                        {selectedRequest.requestStatus === 'PENDING' ? 'Pending' :
                                            selectedRequest.requestStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-medium">Period</Label>
                                    <p>{format(new Date(selectedRequest.startDate), 'dd/MM/yyyy')} - {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy')}</p>
                                </div>
                                <div>
                                    <Label className="font-medium">Affected Shifts</Label>
                                    <p>{selectedRequest.affectedShiftsCount} shifts</p>
                                </div>
                            </div>

                            <div>
                                <Label className="font-medium">Reason</Label>
                                <p>{selectedRequest.reason}</p>
                            </div>

                            <div>
                                <Label className="font-medium">Requested Shifts</Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRequest.requestedShifts.map(shift => (
                                        <Badge key={shift.id} variant="secondary">
                                            {shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedRequest.managerNote && (
                                <div>
                                    <Label className="font-medium">Manager Note</Label>
                                    <p>{selectedRequest.managerNote}</p>
                                </div>
                            )}

                            {selectedRequest.approvedBy && (
                                <div>
                                    <Label className="font-medium">Approved By</Label>
                                    <p>{selectedRequest.approvedBy.fullName}</p>
                                    {selectedRequest.approvedAt && (
                                        <p className="text-sm text-gray-600">
                                            Approved on: {format(new Date(selectedRequest.approvedAt), 'dd/MM/yyyy HH:mm')}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                {selectedRequest.isManagerAdded && (
                                    <Badge variant="outline" className="ml-2">Manager Added</Badge>
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