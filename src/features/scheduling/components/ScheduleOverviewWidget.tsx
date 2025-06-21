'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Shield, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useScheduleLocksInRange, useActiveScheduleLock } from '@/api/v1/schedule-locks';
import { useBranchScheduleConfig } from '@/api/v1/branch-schedule-config';
import { format, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

interface ScheduleOverviewWidgetProps {
    onOpenLockManager?: () => void;
    onOpenConfig?: () => void;
    compact?: boolean;
}

export function ScheduleOverviewWidget({
    onOpenLockManager,
    onOpenConfig,
    compact = false
}: ScheduleOverviewWidgetProps) {
    const { user } = useAuth();
    const branchId = user?.branch?.id;

    // Date ranges for analysis
    const today = new Date();
    const weekStart = format(startOfWeek(today), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(today), 'yyyy-MM-dd');
    const monthStart = format(subDays(today, 30), 'yyyy-MM-dd');
    const monthEnd = format(addDays(today, 30), 'yyyy-MM-dd');

    // API calls
    const { data: weeklyLocks } = useScheduleLocksInRange(branchId!, weekStart, weekEnd);
    const { data: monthlyLocks } = useScheduleLocksInRange(branchId!, monthStart, monthEnd);
    const { data: todayLock } = useActiveScheduleLock(branchId!, format(today, 'yyyy-MM-dd'));
    const { data: config } = useBranchScheduleConfig(branchId!);

    // Calculate metrics
    const activeLocks = monthlyLocks?.filter(lock => lock.lockStatus === 'LOCKED') || [];
    const weeklyActiveLocks = weeklyLocks?.filter(lock => lock.lockStatus === 'LOCKED') || [];
    const upcomingLocks = activeLocks.filter(lock =>
        new Date(lock.startDate) > today
    );

    const isCurrentlyLocked = !!todayLock;
    const hasWeeklyLocks = weeklyActiveLocks.length > 0;
    const lockCoverage = monthlyLocks ?
        Math.round((activeLocks.length / Math.max(monthlyLocks.length, 1)) * 100) : 0;

    if (!branchId) return null;

    if (compact) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Schedule Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Today's Status:</span>
                        <Badge variant={isCurrentlyLocked ? "destructive" : "success"}>
                            {isCurrentlyLocked ? "Locked" : "Unlocked"}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm">This Week:</span>
                        <Badge variant={hasWeeklyLocks ? "secondary" : "outline"}>
                            {weeklyActiveLocks.length} Locks
                        </Badge>
                    </div>

                    {upcomingLocks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{upcomingLocks.length} upcoming locks</span>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        {onOpenLockManager && (
                            <Button variant="outline" size="sm" onClick={onOpenLockManager}>
                                Manage
                            </Button>
                        )}
                        {onOpenConfig && (
                            <Button variant="outline" size="sm" onClick={onOpenConfig}>
                                Settings
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Current Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Current Status
                    </CardTitle>
                    <CardDescription>
                        Today's schedule lock status and active configuration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Today ({format(today, 'MMM dd')}):</span>
                        <Badge variant={isCurrentlyLocked ? "destructive" : "success"}>
                            {isCurrentlyLocked ? "Locked" : "Unlocked"}
                        </Badge>
                    </div>

                    {todayLock && (
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div>Locked by: {todayLock.lockedByName}</div>
                            <div>At: {format(new Date(todayLock.lockedAt), 'HH:mm')}</div>
                            {todayLock.lockReason && (
                                <div className="text-xs">"{todayLock.lockReason}"</div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {config && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Configuration:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Max Shifts/Week: {config.maxShiftsPerWeek}</div>
                                <div>Max Shifts/Day: {config.maxShiftsPerDay}</div>
                                <div>Min Rest: {config.minRestHoursBetweenShifts}h</div>
                                <div>
                                    <Badge variant={config.autoAssignEnabled ? "default" : "secondary"} className="text-xs">
                                        Auto Assign
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lock Analytics Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Lock Analytics
                    </CardTitle>
                    <CardDescription>
                        Schedule lock statistics and trends
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{activeLocks.length}</div>
                            <div className="text-xs text-muted-foreground">Active Locks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{weeklyActiveLocks.length}</div>
                            <div className="text-xs text-muted-foreground">This Week</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Lock Coverage:</span>
                            <span className="font-medium">{lockCoverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${lockCoverage}%` }}
                            />
                        </div>
                    </div>

                    {upcomingLocks.length > 0 && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{upcomingLocks.length} upcoming locks</span>
                            </div>
                            <div className="space-y-1">
                                {upcomingLocks.slice(0, 2).map((lock) => (
                                    <div key={lock.id} className="text-xs text-muted-foreground">
                                        {format(new Date(lock.startDate), 'MMM dd')} - {format(new Date(lock.endDate), 'MMM dd')}
                                    </div>
                                ))}
                                {upcomingLocks.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                        ...and {upcomingLocks.length - 2} more
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                    <CardDescription>
                        Manage schedule settings and locks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {onOpenLockManager && (
                        <Button
                            variant="outline"
                            onClick={onOpenLockManager}
                            className="w-full justify-start"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Schedule Locks
                        </Button>
                    )}

                    {onOpenConfig && (
                        <Button
                            variant="outline"
                            onClick={onOpenConfig}
                            className="w-full justify-start"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Configuration
                        </Button>
                    )}

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                        <div className="font-medium mb-2">Branch: {user?.branch?.name}</div>
                        <div className="text-xs">
                            Last updated: {format(new Date(), 'HH:mm')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 