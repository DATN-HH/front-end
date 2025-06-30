'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock } from 'lucide-react';
import { LeaveRequest, getLeaveTypeLabel, getLeaveStatusLabel } from '@/api/v1/leave-management';
import { format } from 'date-fns';

interface PendingRequestsListProps {
    requests: LeaveRequest[];
    isLoading: boolean;
    onViewAll: () => void;
}

export function PendingRequestsList({ requests, isLoading, onViewAll }: PendingRequestsListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pending Requests
                    </CardTitle>
                    <CardDescription>
                        Leave requests awaiting approval
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pending Requests
                    </CardTitle>
                    <CardDescription>
                        Leave requests awaiting approval
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-muted-foreground">All requests have been processed</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Requests
                </CardTitle>
                <CardDescription>
                    Leave requests awaiting approval
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {requests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex-1">
                                <p className="font-medium">{request.employeeName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {getLeaveTypeLabel(request.leaveType)} • {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                                </p>
                            </div>
                            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                                {getLeaveStatusLabel(request.status)}
                            </Badge>
                        </div>
                    ))}
                    {requests.length > 5 && (
                        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full mt-3">
                            View All ({requests.length - 5} more)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 