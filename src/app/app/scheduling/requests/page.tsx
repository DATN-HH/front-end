'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Sample data for employees
const employees = [
  { id: 1, name: 'John Smith', roleId: 3, avatar: '/avatars/john.png' },
  { id: 2, name: 'Sarah Johnson', roleId: 5, avatar: '/avatars/sarah.png' },
  { id: 3, name: 'Michael Brown', roleId: 1, avatar: '/avatars/michael.png' },
  { id: 4, name: 'Emily Davis', roleId: 2, avatar: '/avatars/emily.png' },
  { id: 5, name: 'David Wilson', roleId: 4, avatar: '/avatars/david.png' },
];

// Sample data for time-off requests
const initialRequests = [
  {
    id: 1,
    employeeId: 1,
    type: 'time-off',
    startDate: new Date(2025, 4, 15),
    endDate: new Date(2025, 4, 16),
    status: 'pending',
    reason: 'Family vacation',
    requestDate: new Date(2025, 4, 1),
  },
  {
    id: 2,
    employeeId: 3,
    type: 'time-off',
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 20),
    status: 'approved',
    reason: "Doctor's appointment",
    requestDate: new Date(2025, 3, 25),
  },
  {
    id: 3,
    employeeId: 2,
    type: 'shift-change',
    shiftDate: new Date(2025, 4, 10),
    shiftId: 12,
    targetEmployeeId: 5,
    status: 'pending',
    reason: 'Personal commitment',
    requestDate: new Date(2025, 4, 3),
  },
  {
    id: 4,
    employeeId: 4,
    type: 'time-off',
    startDate: new Date(2025, 4, 25),
    endDate: new Date(2025, 4, 27),
    status: 'rejected',
    reason: 'Wedding attendance',
    requestDate: new Date(2025, 4, 2),
    rejectionReason: 'Busy period, insufficient staff coverage',
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [replacementEmployee, setReplacementEmployee] = useState<string>('');

  // Get employee by ID
  const getEmployee = (id: number) => {
    return employees.find((emp) => emp.id === id);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle approving a request
  const handleApproveRequest = () => {
    setRequests(
      requests.map((req) => {
        if (req.id === currentRequest.id) {
          if (req.type === 'shift-change' && replacementEmployee) {
            return {
              ...req,
              status: 'approved',
              targetEmployeeId: Number.parseInt(replacementEmployee),
            };
          }
          return { ...req, status: 'approved' };
        }
        return req;
      })
    );
    setIsApproveDialogOpen(false);
  };

  // Handle rejecting a request
  const handleRejectRequest = () => {
    setRequests(
      requests.map((req) => {
        if (req.id === currentRequest.id) {
          return { ...req, status: 'rejected', rejectionReason };
        }
        return req;
      })
    );
    setRejectionReason('');
    setIsRejectDialogOpen(false);
  };

  // Filter requests by status
  const pendingRequests = requests.filter((req) => req.status === 'pending');
  const approvedRequests = requests.filter((req) => req.status === 'approved');
  const rejectedRequests = requests.filter((req) => req.status === 'rejected');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Time-Off & Shift Change Requests
        </h1>
        <p className="text-muted-foreground">
          Manage employee requests for time off and shift changes
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => {
                    const employee = getEmployee(request.employeeId);
                    return (
                      <div key={request.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={employee?.avatar || '/placeholder.svg'}
                                alt={employee?.name}
                              />
                              <AvatarFallback>
                                {employee ? getInitials(employee.name) : '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{employee?.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-orange-500">
                                  {request.type === 'time-off'
                                    ? 'Time Off'
                                    : 'Shift Change'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Requested on{' '}
                                  {format(request.requestDate, 'MMM d, yyyy')}
                                </span>
                              </div>

                              {request.type === 'time-off' ? (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(request.startDate, 'MMM d, yyyy')}
                                    {request.startDate.getTime() !==
                                      request.endDate.getTime() &&
                                      ` - ${format(request.endDate, 'MMM d, yyyy')}`}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Shift on{' '}
                                    {format(request.shiftDate, 'MMM d, yyyy')}
                                  </span>
                                </div>
                              )}

                              <p className="text-sm mt-2">{request.reason}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500"
                              onClick={() => {
                                setCurrentRequest(request);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => {
                                setCurrentRequest(request);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>Previously approved requests</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No approved requests
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map((request) => {
                    const employee = getEmployee(request.employeeId);
                    return (
                      <div key={request.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={employee?.avatar || '/placeholder.svg'}
                                alt={employee?.name}
                              />
                              <AvatarFallback>
                                {employee ? getInitials(employee.name) : '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{employee?.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-500">Approved</Badge>
                                <Badge className="bg-orange-500">
                                  {request.type === 'time-off'
                                    ? 'Time Off'
                                    : 'Shift Change'}
                                </Badge>
                              </div>

                              {request.type === 'time-off' ? (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(request.startDate, 'MMM d, yyyy')}
                                    {request.startDate.getTime() !==
                                      request.endDate.getTime() &&
                                      ` - ${format(request.endDate, 'MMM d, yyyy')}`}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Shift on{' '}
                                    {format(request.shiftDate, 'MMM d, yyyy')}
                                  </span>
                                </div>
                              )}

                              <p className="text-sm mt-2">{request.reason}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentRequest(request);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>Previously rejected requests</CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No rejected requests
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedRequests.map((request) => {
                    const employee = getEmployee(request.employeeId);
                    return (
                      <div key={request.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={employee?.avatar || '/placeholder.svg'}
                                alt={employee?.name}
                              />
                              <AvatarFallback>
                                {employee ? getInitials(employee.name) : '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{employee?.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="destructive">Rejected</Badge>
                                <Badge className="bg-orange-500">
                                  {request.type === 'time-off'
                                    ? 'Time Off'
                                    : 'Shift Change'}
                                </Badge>
                              </div>

                              {request.type === 'time-off' ? (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(request.startDate, 'MMM d, yyyy')}
                                    {request.startDate.getTime() !==
                                      request.endDate.getTime() &&
                                      ` - ${format(request.endDate, 'MMM d, yyyy')}`}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Shift on{' '}
                                    {format(request.shiftDate, 'MMM d, yyyy')}
                                  </span>
                                </div>
                              )}

                              <p className="text-sm mt-2">{request.reason}</p>

                              {request.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 text-sm rounded-md">
                                  <span className="font-medium">
                                    Rejection reason:
                                  </span>{' '}
                                  {request.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentRequest(request);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View the details of this request
            </DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        getEmployee(currentRequest.employeeId)?.avatar ||
                        '/placeholder.svg'
                      }
                      alt={getEmployee(currentRequest.employeeId)?.name}
                    />
                    <AvatarFallback>
                      {getEmployee(currentRequest.employeeId)
                        ? getInitials(
                            getEmployee(currentRequest.employeeId)?.name
                          )
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getEmployee(currentRequest.employeeId)?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={
                          currentRequest.status === 'approved'
                            ? 'bg-green-500'
                            : currentRequest.status === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-orange-500'
                        }
                      >
                        {currentRequest.status.charAt(0).toUpperCase() +
                          currentRequest.status.slice(1)}
                      </Badge>
                      <Badge className="bg-orange-500">
                        {currentRequest.type === 'time-off'
                          ? 'Time Off'
                          : 'Shift Change'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Request Date:</span>{' '}
                    {format(currentRequest.requestDate, 'MMMM d, yyyy')}
                  </div>

                  {currentRequest.type === 'time-off' ? (
                    <div className="text-sm">
                      <span className="font-medium">Time Off Period:</span>{' '}
                      {format(currentRequest.startDate, 'MMMM d, yyyy')}
                      {currentRequest.startDate.getTime() !==
                        currentRequest.endDate.getTime() &&
                        ` - ${format(currentRequest.endDate, 'MMMM d, yyyy')}`}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span className="font-medium">Shift Date:</span>{' '}
                      {format(currentRequest.shiftDate, 'MMMM d, yyyy')}
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-medium">Reason:</span>{' '}
                    {currentRequest.reason}
                  </div>

                  {currentRequest.status === 'rejected' &&
                    currentRequest.rejectionReason && (
                      <div className="text-sm p-2 bg-red-50 rounded-md">
                        <span className="font-medium">Rejection Reason:</span>{' '}
                        {currentRequest.rejectionReason}
                      </div>
                    )}

                  {currentRequest.type === 'shift-change' &&
                    currentRequest.targetEmployeeId && (
                      <div className="text-sm">
                        <span className="font-medium">Replacement:</span>{' '}
                        {getEmployee(currentRequest.targetEmployeeId)?.name}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Request Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Confirm approval of this request
            </DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        getEmployee(currentRequest.employeeId)?.avatar ||
                        '/placeholder.svg'
                      }
                      alt={getEmployee(currentRequest.employeeId)?.name}
                    />
                    <AvatarFallback>
                      {getEmployee(currentRequest.employeeId)
                        ? getInitials(
                            getEmployee(currentRequest.employeeId)?.name
                          )
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getEmployee(currentRequest.employeeId)?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-orange-500">
                        {currentRequest.type === 'time-off'
                          ? 'Time Off'
                          : 'Shift Change'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {currentRequest.type === 'time-off' ? (
                  <div className="text-sm">
                    <span className="font-medium">Time Off Period:</span>{' '}
                    {format(currentRequest.startDate, 'MMMM d, yyyy')}
                    {currentRequest.startDate.getTime() !==
                      currentRequest.endDate.getTime() &&
                      ` - ${format(currentRequest.endDate, 'MMMM d, yyyy')}`}
                  </div>
                ) : (
                  <>
                    <div className="text-sm">
                      <span className="font-medium">Shift Date:</span>{' '}
                      {format(currentRequest.shiftDate, 'MMMM d, yyyy')}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Select Replacement Employee
                      </label>
                      <Select
                        value={replacementEmployee}
                        onValueChange={setReplacementEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees
                            .filter(
                              (emp) => emp.id !== currentRequest.employeeId
                            )
                            .map((emp) => (
                              <SelectItem
                                key={emp.id}
                                value={emp.id.toString()}
                              >
                                {emp.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleApproveRequest}
              disabled={
                currentRequest?.type === 'shift-change' && !replacementEmployee
              }
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        getEmployee(currentRequest.employeeId)?.avatar ||
                        '/placeholder.svg'
                      }
                      alt={getEmployee(currentRequest.employeeId)?.name}
                    />
                    <AvatarFallback>
                      {getEmployee(currentRequest.employeeId)
                        ? getInitials(
                            getEmployee(currentRequest.employeeId)?.name
                          )
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {getEmployee(currentRequest.employeeId)?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-orange-500">
                        {currentRequest.type === 'time-off'
                          ? 'Time Off'
                          : 'Shift Change'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Reason for Rejection
                  </label>
                  <Textarea
                    placeholder="Provide a reason for rejecting this request"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
