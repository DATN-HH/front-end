'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Users, Clock } from 'lucide-react';
import { LeaveBalance } from '@/api/v1/leave-management';

interface LeaveBalanceOverviewProps {
    lowBalanceEmployees: LeaveBalance[];
    isLoading: boolean;
    threshold?: number;
}

export function LeaveBalanceOverview({ lowBalanceEmployees, isLoading, threshold = 2 }: LeaveBalanceOverviewProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Low Leave Balance Alert
                    </CardTitle>
                    <CardDescription>
                        Employees with low remaining leave days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (lowBalanceEmployees.length === 0) {
        return (
            <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                        <Users className="h-5 w-5" />
                        Leave Balance Status
                    </CardTitle>
                    <CardDescription>
                        All employees have sufficient leave balance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All employees are in good standing</p>
                        <p className="text-sm text-green-600">No employees with leave balance ≤ {threshold} days</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gold-200 bg-gold-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold-700">
                    <AlertTriangle className="h-5 w-5" />
                    Low Leave Balance Alert
                </CardTitle>
                <CardDescription>
                    {lowBalanceEmployees.length} employee{lowBalanceEmployees.length !== 1 ? 's' : ''} with ≤ {threshold} days remaining
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {lowBalanceEmployees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 border border-gold-200 rounded-lg bg-white">
                            <div className="flex-1">
                                <p className="font-medium">{employee.userName}</p>
                                <p className="text-sm text-muted-foreground">{employee.userEmail}</p>
                                <p className="text-sm text-muted-foreground">
                                    Used: {employee.usedDays}/{employee.totalAllocatedDays} days
                                </p>
                            </div>
                            <div className="text-right">
                                <Badge
                                    variant={employee.remainingDays <= 0 ? "destructive" : "outline"}
                                    className={employee.remainingDays <= 0 ? "" : "border-gold-300 bg-gold-100 text-gold-700"}
                                >
                                    {employee.remainingDays} days left
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {employee.branchName}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 