import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveStatistics } from '@/api/v1/leave-management';

interface LeaveQuickStatsProps {
    statistics?: LeaveStatistics;
    isLoading: boolean;
    pendingCount: number;
    lowBalanceCount: number;
}

export function LeaveQuickStats({
    statistics,
    isLoading,
    pendingCount,
    lowBalanceCount,
}: LeaveQuickStatsProps) {
    const approvalRate = statistics?.totalLeaveRequests
        ? Math.round((statistics.approvedRequests / statistics.totalLeaveRequests) * 100)
        : 0;

    const stats = [
        {
            title: 'Pending Requests',
            value: pendingCount,
            icon: Users,
            description: 'Awaiting approval',
            color: 'text-blue-600',
        },
        {
            title: 'Total Requests',
            value: statistics?.totalLeaveRequests || 0,
            icon: TrendingUp,
            description: 'This year',
            color: 'text-primary',
        },
        {
            title: 'Approval Rate',
            value: `${approvalRate}%`,
            icon: CheckCircle,
            description: 'Approved requests',
            color: 'text-green-600',
        },
        {
            title: 'Low Balance Alerts',
            value: lowBalanceCount,
            icon: AlertTriangle,
            description: 'Employees with low balance',
            color: 'text-amber-600',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 