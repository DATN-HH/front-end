"use client"

import { useState } from "react"
import { PageTitle } from "@/components/layouts/app-section/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Calendar,
    Clock,
    Users,
    Shield,
    Lock,
    Brain,
    TrendingUp,
    Settings,
    AlertCircle,
    CheckCircle,
    BarChart3
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useBranchScheduleConfig, ScheduleLockStatus } from "@/api/v1/branch-schedule-config"
import { useBranchScheduleLocks } from "@/api/v1/schedule-locks"
import { BranchScheduleConfig } from "@/features/scheduling/components/BranchScheduleConfig"
import { ScheduleLockManager } from "@/features/scheduling/components/ScheduleLockManager"
import { ShiftAssignmentSuggestions } from "@/features/scheduling/components/ShiftAssignmentSuggestions"
import { ScheduleOverviewWidget } from "@/features/scheduling/components/ScheduleOverviewWidget"

export default function ScheduleDashboardPage() {
    const { user } = useAuth()
    const branchId = user?.branch?.id

    const { data: config, isLoading: isLoadingConfig } = useBranchScheduleConfig(branchId!)
    const { data: locks, isLoading: isLoadingLocks } = useBranchScheduleLocks(branchId!)

    const [isScheduleConfigOpen, setIsScheduleConfigOpen] = useState(false)
    const [isScheduleLockManagerOpen, setIsScheduleLockManagerOpen] = useState(false)
    const [isShiftSuggestionsOpen, setIsShiftSuggestionsOpen] = useState(false)

    const activeLocks = locks?.filter(lock => lock.lockStatus === ScheduleLockStatus.LOCKED) || []

    // Mock data for demonstration
    const weeklyStats = {
        totalShifts: 156,
        assignedShifts: 142,
        openShifts: 14,
        coverage: 91
    }

    const staffMetrics = {
        totalStaff: 32,
        activeStaff: 28,
        onLeave: 4,
        utilization: 87
    }

    return (
        <div className="min-h-screen bg-white">
            <PageTitle
                icon={BarChart3}
                title="Schedule Dashboard"
                description={`Overview of scheduling activities for ${user?.branch?.name}`}
                left={
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsScheduleConfigOpen(true)}
                            variant="outline"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                        </Button>
                        <Button
                            onClick={() => setIsShiftSuggestionsOpen(true)}
                        >
                            <Brain className="mr-2 h-4 w-4" />
                            AI Suggestions
                        </Button>
                    </div>
                }
            />

            <div className="container mx-auto p-6 space-y-8">
                {/* Schedule Overview Widget */}
                <ScheduleOverviewWidget
                    onOpenLockManager={() => setIsScheduleLockManagerOpen(true)}
                    onOpenConfig={() => setIsScheduleConfigOpen(true)}
                />

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Shifts</p>
                                    <p className="text-3xl font-bold">{weeklyStats.totalShifts}</p>
                                    <p className="text-xs text-muted-foreground">This week</p>
                                </div>
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                                    <p className="text-3xl font-bold">{weeklyStats.assignedShifts}</p>
                                    <p className="text-xs text-muted-foreground">{weeklyStats.openShifts} remaining</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                                    <p className="text-3xl font-bold">{weeklyStats.coverage}%</p>
                                    <Progress value={weeklyStats.coverage} className="mt-2" />
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Locks</p>
                                    <p className="text-3xl font-bold">{activeLocks.length}</p>
                                    <p className="text-xs text-muted-foreground">Schedule locks</p>
                                </div>
                                <Lock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Brain className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                <div className="space-y-2">
                                    <h3 className="font-medium text-blue-900">AI-Powered Suggestions</h3>
                                    <p className="text-sm text-blue-700">
                                        Get intelligent staff assignment recommendations based on skills, availability, and workload optimization.
                                    </p>
                                    <Button
                                        onClick={() => setIsShiftSuggestionsOpen(true)}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Try AI Suggestions
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Settings className="h-8 w-8 text-green-600 flex-shrink-0" />
                                <div className="space-y-2">
                                    <h3 className="font-medium text-green-900">Smart Configuration</h3>
                                    <p className="text-sm text-green-700">
                                        Configure shift limits, approval workflows, and assignment rules to match your business needs.
                                    </p>
                                    <Button
                                        onClick={() => setIsScheduleConfigOpen(true)}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Configure Rules
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <Lock className="h-8 w-8 text-purple-600 flex-shrink-0" />
                                <div className="space-y-2">
                                    <h3 className="font-medium text-purple-900">Schedule Protection</h3>
                                    <p className="text-sm text-purple-700">
                                        Lock published schedules to prevent unauthorized changes and maintain schedule integrity.
                                    </p>
                                    <Button
                                        onClick={() => setIsScheduleLockManagerOpen(true)}
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        Manage Locks
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <BranchScheduleConfig open={isScheduleConfigOpen} onOpenChange={setIsScheduleConfigOpen} />
            <ScheduleLockManager open={isScheduleLockManagerOpen} onOpenChange={setIsScheduleLockManagerOpen} />
            <ShiftAssignmentSuggestions open={isShiftSuggestionsOpen} onOpenChange={setIsShiftSuggestionsOpen} />
        </div>
    )
} 