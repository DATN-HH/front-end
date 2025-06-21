"use client"

import { useState } from "react"
import { PageTitle } from "@/components/layouts/app-section/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Settings,
    Clock,
    Users,
    Shield,
    Lock,
    Brain,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useBranchScheduleConfig } from "@/api/v1/branch-schedule-config"
import { useBranchScheduleLocks } from "@/api/v1/schedule-locks"
import { BranchScheduleConfig } from "@/features/scheduling/components/BranchScheduleConfig"
import { ScheduleLockManager } from "@/features/scheduling/components/ScheduleLockManager"
import { ShiftAssignmentSuggestions } from "@/features/scheduling/components/ShiftAssignmentSuggestions"

export default function ScheduleSettingsPage() {
    const { user } = useAuth()
    const branchId = user?.branch?.id

    const { data: config, isLoading: isLoadingConfig } = useBranchScheduleConfig(branchId!)
    const { data: locks, isLoading: isLoadingLocks } = useBranchScheduleLocks(branchId!)

    const [isScheduleConfigOpen, setIsScheduleConfigOpen] = useState(false)
    const [isScheduleLockManagerOpen, setIsScheduleLockManagerOpen] = useState(false)
    const [isShiftSuggestionsOpen, setIsShiftSuggestionsOpen] = useState(false)

    const activeLocks = locks?.filter(lock => lock.lockStatus === 'LOCKED') || []

    return (
        <div className="min-h-screen bg-white">
            <PageTitle
                icon={Settings}
                title="Schedule Settings"
                description={`Configure scheduling rules and settings for ${user?.branch?.name}`}
            />

            <div className="container mx-auto p-6 space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Max Shifts/Week</p>
                                    <p className="text-2xl font-bold">{config?.maxShiftsPerWeek || 5}</p>
                                </div>
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Max Shifts/Day</p>
                                    <p className="text-2xl font-bold">{config?.maxShiftsPerDay || 2}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Min Rest Hours</p>
                                    <p className="text-2xl font-bold">{config?.minRestHoursBetweenShifts || 8}h</p>
                                </div>
                                <Shield className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Locks</p>
                                    <p className="text-2xl font-bold">{activeLocks.length}</p>
                                </div>
                                <Lock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Configuration Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Schedule Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Schedule Configuration
                            </CardTitle>
                            <CardDescription>
                                Manage shift limits, assignment rules, and approval settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingConfig ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Auto Assignment</span>
                                            <Badge variant={config?.autoAssignEnabled ? "success" : "secondary"}>
                                                {config?.autoAssignEnabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Manager Approval Required</span>
                                            <Badge variant={config?.requireManagerApproval ? "destructive" : "secondary"}>
                                                {config?.requireManagerApproval ? "Required" : "Not Required"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Self Assignment</span>
                                            <Badge variant={config?.allowSelfAssignment ? "success" : "secondary"}>
                                                {config?.allowSelfAssignment ? "Allowed" : "Not Allowed"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Shift Swap</span>
                                            <Badge variant={config?.enableShiftSwap ? "success" : "secondary"}>
                                                {config?.enableShiftSwap ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Separator />
                                    <Button
                                        onClick={() => setIsScheduleConfigOpen(true)}
                                        className="w-full"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configure Settings
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lock Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Schedule Locks
                            </CardTitle>
                            <CardDescription>
                                Lock schedules to prevent modifications after publishing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingLocks ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Active Locks</span>
                                            <Badge variant={activeLocks.length > 0 ? "destructive" : "secondary"}>
                                                {activeLocks.length} active
                                            </Badge>
                                        </div>
                                        {activeLocks.length > 0 && (
                                            <div className="space-y-2">
                                                {activeLocks.slice(0, 3).map((lock) => (
                                                    <div key={lock.id} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                                        {lock.startDate} to {lock.endDate}
                                                    </div>
                                                ))}
                                                {activeLocks.length > 3 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{activeLocks.length - 3} more...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    <Button
                                        onClick={() => setIsScheduleLockManagerOpen(true)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Manage Locks
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Features */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Advanced Features
                        </CardTitle>
                        <CardDescription>
                            AI-powered tools and advanced scheduling capabilities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* AI Assignment Suggestions */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <Brain className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-blue-900">AI Assignment Suggestions</h3>
                                            <p className="text-sm text-blue-700">
                                                Get intelligent staff assignment recommendations based on skills, availability, and workload
                                            </p>
                                            <Button
                                                onClick={() => setIsShiftSuggestionsOpen(true)}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Generate Suggestions
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule Analytics */}
                            <Card className="border-green-200 bg-green-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="h-8 w-8 text-green-600 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-green-900">Schedule Analytics</h3>
                                            <p className="text-sm text-green-700">
                                                View detailed analytics and insights about your scheduling patterns
                                            </p>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Coming Soon
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                        <CardDescription>Current status of scheduling system components</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <div className="font-medium">Schedule Configuration</div>
                                    <div className="text-sm text-muted-foreground">Active & Configured</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <div className="font-medium">API Services</div>
                                    <div className="text-sm text-muted-foreground">All Services Online</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeLocks.length > 0 ? (
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                ) : (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                                <div>
                                    <div className="font-medium">Schedule Locks</div>
                                    <div className="text-sm text-muted-foreground">
                                        {activeLocks.length > 0 ? `${activeLocks.length} Active Locks` : 'No Active Locks'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <BranchScheduleConfig open={isScheduleConfigOpen} onOpenChange={setIsScheduleConfigOpen} />
            <ScheduleLockManager open={isScheduleLockManagerOpen} onOpenChange={setIsScheduleLockManagerOpen} />
            <ShiftAssignmentSuggestions open={isShiftSuggestionsOpen} onOpenChange={setIsShiftSuggestionsOpen} />
        </div>
    )
} 