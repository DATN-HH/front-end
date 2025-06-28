import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveStatistics } from '@/api/v1/leave-management';

interface LeaveStatisticsCardProps {
    statistics?: LeaveStatistics;
    isLoading: boolean;
    year: number;
}

export function LeaveStatisticsCard({
    statistics,
    isLoading,
    year,
}: LeaveStatisticsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2 p-3 border rounded-lg">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-8" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-5 w-8" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalRequests = statistics?.totalLeaveRequests || 0;

    const statusData = [
        {
            label: 'Pending',
            value: statistics?.pendingRequests || 0,
            icon: Clock,
            variant: 'secondary' as const,
        },
        {
            label: 'Approved',
            value: statistics?.approvedRequests || 0,
            icon: CheckCircle,
            variant: 'default' as const,
        },
        {
            label: 'Rejected',
            value: statistics?.rejectedRequests || 0,
            icon: XCircle,
            variant: 'destructive' as const,
        },
        {
            label: 'Cancelled',
            value: statistics?.cancelledRequests || 0,
            icon: AlertCircle,
            variant: 'outline' as const,
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4" />
                    Leave Analytics {year}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Key Metrics */}
                <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Total Requests</div>
                        <div className="text-lg font-semibold">{totalRequests}</div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {statusData.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    <Badge variant={item.variant} className="text-sm px-2 py-1">
                                        {item.value}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Avg</div>
                        <div className="text-sm font-medium">{statistics?.averageUsedDays?.toFixed(1) || '0.0'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Max</div>
                        <div className="text-sm font-medium">{statistics?.maxUsedDays || 0}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Min</div>
                        <div className="text-sm font-medium">{statistics?.minUsedDays || 0}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 