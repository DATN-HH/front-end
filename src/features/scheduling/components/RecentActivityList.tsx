import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveRequest, getLeaveTypeLabel } from '@/api/v1/leave-management';
import { format } from 'date-fns';

interface RecentActivityListProps {
    requests: LeaveRequest[];
    isLoading: boolean;
    onViewAll: () => void;
}

export function RecentActivityList({
    requests,
    isLoading,
    onViewAll,
}: RecentActivityListProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'approved':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const formatActivityDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-48 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show only the most recent 10 requests
    const recentRequests = requests
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={onViewAll} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recentRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No recent leave requests found
                    </div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {request.employeeName || 'Unknown Employee'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {getLeaveTypeLabel(request.leaveType)} • {formatActivityDate(request.createdAt)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={getStatusColor(request.status)}
                                >
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 