'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { FileText, Calendar, Clock, CheckCircle, XCircle, Plus, TrendingUp } from 'lucide-react';
import { EmployeeLeaveManagement } from '@/features/employee-portal/components/EmployeeLeaveManagement';
import {
    useMyLeaveRequests,
    useMyLeaveBalance,
    LeaveStatus,
    getLeaveStatusLabel,
    getLeaveTypeLabel,
    getStatusColor
} from '@/api/v1/leave-management';
import { format } from 'date-fns';

export default function EmployeeLeaveManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    // API hooks
    const { data: leaveRequests = [], isLoading: isLoadingRequests } = useMyLeaveRequests(currentYear);
    const { data: leaveBalance, isLoading: isLoadingBalance } = useMyLeaveBalance(currentYear);

    // Calculate stats
    const pendingRequests = leaveRequests.filter(req => req.status === LeaveStatus.PENDING);
    const approvedRequests = leaveRequests.filter(req => req.status === LeaveStatus.APPROVED);
    const rejectedRequests = leaveRequests.filter(req => req.status === LeaveStatus.REJECTED);

    const getStatusIcon = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return <CheckCircle className="h-4 w-4 text-green-600" />;
            case LeaveStatus.PENDING: return <Clock className="h-4 w-4 text-yellow-600" />;
            case LeaveStatus.REJECTED: return <XCircle className="h-4 w-4 text-red-600" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Calendar}
                title="My Leave Management"
                left={
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Request Leave
                    </Button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leaveRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leaveBalance?.remainingDays || 0}</p>
                                <p className="text-sm text-muted-foreground">Days Left</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Balance Overview */}
            {leaveBalance && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Leave Balance Overview {currentYear}
                        </CardTitle>
                        <CardDescription>
                            Detailed information about your leave balance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeaveDays}</p>
                                <p className="text-sm text-muted-foreground">Annual</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{leaveBalance.carriedOverDays}</p>
                                <p className="text-sm text-muted-foreground">Carried Over</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{leaveBalance.bonusDays}</p>
                                <p className="text-sm text-muted-foreground">Bonus</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{leaveBalance.usedDays}</p>
                                <p className="text-sm text-muted-foreground">Used</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">{leaveBalance.remainingDays}</p>
                                <p className="text-sm text-muted-foreground">Remaining</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Leave Requests */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Leave Requests
                            </CardTitle>
                            <CardDescription>
                                Your latest leave applications
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingRequests ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-16 bg-muted rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-muted-foreground">You don't have any leave requests yet</p>
                            <Button
                                className="mt-4"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Submit Your First Request
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaveRequests.slice(0, 5).map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(request.status)}
                                        <div>
                                            <p className="font-medium">{getLeaveTypeLabel(request.leaveType)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                                                {request.reason && ` • ${request.reason}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={getStatusColor(request.status)}>
                                            {getLeaveStatusLabel(request.status)}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {leaveRequests.length > 5 && (
                                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="w-full">
                                    View All Requests ({leaveRequests.length - 5} more)
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Leave Management Modal */}
            <EmployeeLeaveManagement
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
} 