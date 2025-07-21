'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Plus, Eye, X } from 'lucide-react';
import { useState } from 'react';

import {
  useCreateShiftLeaveRequest,
  useMyShiftLeaveRequests,
  useCancelShiftLeaveRequest,
  useMyShiftLeaveBalance,
  type ShiftLeaveRequestDto,
} from '@/api/v1/shift-leave-management';
import { useShifts } from '@/api/v1/shifts';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

export default function EmployeeShiftLeavePage() {
  const { user } = useAuth();
  const { success, error } = useCustomToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const branchId = user?.branch?.id || 0;
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ShiftLeaveRequestDto | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    selectedShiftIds: [] as number[],
  });

  // API hooks
  const { data: shiftsData } = useShifts(branchId);
  const shifts = shiftsData || [];
  const { data: myRequests, isLoading: isLoadingRequests } =
    useMyShiftLeaveRequests(currentYear);
  const { data: myBalance, isLoading: isLoadingBalance } =
    useMyShiftLeaveBalance(currentYear);
  const createMutation = useCreateShiftLeaveRequest();
  const cancelMutation = useCancelShiftLeaveRequest();

  const requests = myRequests || [];
  const balance = myBalance;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason ||
      formData.selectedShiftIds.length === 0
    ) {
      error('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createMutation.mutateAsync({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        shiftIds: formData.selectedShiftIds,
      });

      success('Success', 'Shift leave request created successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        selectedShiftIds: [],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-shift-leave-requests'],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-shift-leave-balance'],
      });
    } catch (err: any) {
      error(
        'Error',
        err?.response?.data?.message || 'Failed to create request'
      );
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (requestId: number) => {
    try {
      await cancelMutation.mutateAsync(requestId);
      success('Success', 'Request cancelled successfully');
      queryClient.invalidateQueries({
        queryKey: ['my-shift-leave-requests'],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-shift-leave-balance'],
      });
    } catch (err: any) {
      error(
        'Error',
        err?.response?.data?.message || 'Failed to cancel request'
      );
    }
  };

  // Handle shift selection
  const handleShiftChange = (shiftId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedShiftIds: checked
        ? [...prev.selectedShiftIds, shiftId]
        : prev.selectedShiftIds.filter((id) => id !== shiftId),
    }));
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

  // Get selected shifts names
  const getSelectedShiftsNames = () => {
    return formData.selectedShiftIds
      .map((id) => shifts.find((shift) => shift.id === id)?.name)
      .filter(Boolean)
      .join(', ');
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageTitle
        icon={FileText}
        title="Shift Leave Request"
        left={
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 w-full justify-center">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Request</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Shift Leave Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      required
                      min={today} // Employees cannot select past dates
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      required
                      min={today} // Employees cannot select past dates
                    />
                  </div>
                </div>

                <div>
                  <Label>Select Shifts</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`shift-${shift.id}`}
                          checked={formData.selectedShiftIds.includes(shift.id)}
                          onCheckedChange={(checked) =>
                            handleShiftChange(shift.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`shift-${shift.id}`}
                          className="text-sm"
                        >
                          {shift.name} ({formatTime(shift.startTime)} -{' '}
                          {formatTime(shift.endTime)})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.selectedShiftIds.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {getSelectedShiftsNames()}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    required
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createMutation.isPending
                      ? 'Creating...'
                      : 'Create Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <Clock className="h-5 w-5" />
            Shift Leave Balance {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <div>Loading...</div>
          ) : balance ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="text-center p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold text-blue-600">
                  {balance.totalShifts}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  Total Shifts
                </div>
              </div>
              <div className="text-center p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold text-red-600">
                  {balance.usedShifts}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Used</div>
              </div>
              <div className="text-center p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {balance.bonusShifts}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">Bonus</div>
              </div>
              <div className="text-center p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold text-purple-600">
                  {balance.availableShifts}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  Available
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Shift Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div>Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No shift leave requests yet
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3 lg:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm lg:text-base">
                        {format(new Date(request.startDate), 'dd/MM/yyyy')} -{' '}
                        {format(new Date(request.endDate), 'dd/MM/yyyy')}
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1 break-words">
                        {request.reason}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(request.requestStatus)} whitespace-nowrap`}
                    >
                      {request.requestStatus === 'PENDING'
                        ? 'Pending'
                        : request.requestStatus === 'APPROVED'
                          ? 'Approved'
                          : 'Rejected'}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2 text-xs lg:text-sm text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {request.requestedShifts
                        .map(
                          (shift) =>
                            `${shift.name} (${formatTime(shift.startTime)}-${formatTime(shift.endTime)})`
                        )
                        .join(', ')}
                    </span>
                  </div>

                  {request.affectedShiftsCount > 0 && (
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-green-600 mb-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Affected shifts: {request.affectedShiftsCount}
                      </span>
                    </div>
                  )}

                  {request.managerNote && (
                    <div className="flex items-start gap-2 text-xs lg:text-sm text-blue-600 mb-2">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">
                        Manager note: {request.managerNote}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Created:{' '}
                      {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailsDialogOpen(true);
                        }}
                        className="w-full sm:w-auto text-xs"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {request.requestStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={cancelMutation.isPending}
                          className="w-full sm:w-auto text-xs"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shift Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Period</Label>
                  <p className="text-sm">
                    {format(new Date(selectedRequest.startDate), 'dd/MM/yyyy')}{' '}
                    - {format(new Date(selectedRequest.endDate), 'dd/MM/yyyy')}
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

              <div>
                <Label className="font-medium">Reason</Label>
                <p className="text-sm mt-1 break-words">
                  {selectedRequest.reason}
                </p>
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

              {selectedRequest.affectedShiftsCount > 0 && (
                <div>
                  <Label className="font-medium">Affected Shifts</Label>
                  <p className="text-sm mt-1">
                    {selectedRequest.affectedShiftsCount} shifts
                  </p>
                </div>
              )}

              {selectedRequest.managerNote && (
                <div>
                  <Label className="font-medium">Manager Note</Label>
                  <p className="text-sm mt-1 break-words">
                    {selectedRequest.managerNote}
                  </p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div>
                  <Label className="font-medium">Approved By</Label>
                  <p className="text-sm mt-1">
                    {selectedRequest.approvedBy.fullName}
                  </p>
                  {selectedRequest.approvedAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      Approved on:{' '}
                      {format(
                        new Date(selectedRequest.approvedAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs lg:text-sm text-gray-600 pt-2 border-t">
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
                  <Badge variant="outline" className="text-xs">
                    Manager Added
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
