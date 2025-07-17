'use client';

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Clock, Loader2, BarChart3, CalendarCheck, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import { useAuth } from '@/contexts/auth-context';
import {
    useBranchScheduleConfig,
    useCreateOrUpdateBranchScheduleConfig,
    useDeleteBranchScheduleConfig,
    BranchScheduleConfigRequest,
} from '@/api/v1/branch-schedule-config';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

const DAYS_OF_WEEK = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
];

// Loading skeleton component
function ConfigurationSkeleton() {
    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Self Shift Registration Skeleton */}
            <Card>
                <CardHeader className="p-4 lg:p-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32 sm:w-48" />
                            <Skeleton className="h-4 w-48 sm:w-72" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 lg:p-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 sm:w-40" />
                            <Skeleton className="h-3 w-40 sm:w-56" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 sm:w-32" />
                            <Skeleton className="h-11 w-full rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 sm:w-32" />
                            <Skeleton className="h-11 w-full rounded-md" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Other sections skeleton */}
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader className="p-4 lg:p-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-28 sm:w-36" />
                                <Skeleton className="h-4 w-40 sm:w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 lg:p-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24 sm:w-32" />
                                        <Skeleton className="h-3 w-32 sm:w-48" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function ScheduleConfiguration() {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const branchId = user?.branch?.id;

    const { data: config, isLoading: isLoadingConfig } = useBranchScheduleConfig(branchId!);
    const updateConfigMutation = useCreateOrUpdateBranchScheduleConfig();
    const deleteConfigMutation = useDeleteBranchScheduleConfig();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState<BranchScheduleConfigRequest>({
        branchId: branchId!,
        maxShiftsPerWeek: 5,
        maxShiftsPerDay: 2,
        minRestHoursBetweenShifts: 8,
        responseDeadlineHours: 24,
        autoAssignEnabled: false,
        requireManagerApproval: true,
        allowSelfAssignment: true,
        enableShiftSwap: true,
        allowSelfShiftRegistration: false,
        registrationStartDayOfWeek: 1,
        registrationEndDayOfWeek: 5,
        registrationDaysInAdvance: 7,
    });

    useEffect(() => {
        if (config) {
            setFormData({
                branchId: config.branchId,
                maxShiftsPerWeek: config.maxShiftsPerWeek,
                maxShiftsPerDay: config.maxShiftsPerDay,
                minRestHoursBetweenShifts: config.minRestHoursBetweenShifts,
                responseDeadlineHours: config.responseDeadlineHours,
                autoAssignEnabled: config.autoAssignEnabled,
                requireManagerApproval: config.requireManagerApproval,
                allowSelfAssignment: config.allowSelfAssignment,
                enableShiftSwap: config.enableShiftSwap,
                notificationSettings: config.notificationSettings,
                assignmentPriorityRules: config.assignmentPriorityRules,
                allowSelfShiftRegistration: config.allowSelfShiftRegistration,
                registrationStartDayOfWeek: config.registrationStartDayOfWeek,
                registrationEndDayOfWeek: config.registrationEndDayOfWeek,
                registrationDaysInAdvance: config.registrationDaysInAdvance,
            });
        }
    }, [config]);

    const handleInputChange = (field: keyof BranchScheduleConfigRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!branchId) {
            error('Error', 'Branch information not found');
            return;
        }

        try {
            await updateConfigMutation.mutateAsync(formData);
            success('Configuration Updated', 'Branch schedule configuration has been updated successfully');
        } catch (err: any) {
            error('Update Failed', err.response?.data?.message || 'Failed to update configuration');
        }
    };

    const handleDelete = async () => {
        if (!branchId) {
            error('Error', 'Branch information not found');
            return;
        }

        try {
            await deleteConfigMutation.mutateAsync(branchId);
            success('Configuration Deleted', 'Branch schedule configuration has been deleted successfully');
            setShowDeleteConfirm(false);
        } catch (err: any) {
            error('Delete Failed', err.response?.data?.message || 'Failed to delete configuration');
        }
    };

    if (!branchId) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                    <h3 className="text-lg font-semibold text-foreground">Branch Not Found</h3>
                    <p className="text-muted-foreground max-w-md">
                        Unable to load branch information. Please contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header Section */}
            <PageTitle
                icon={Settings}
                title="Schedule Configuration"
                left={
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        {config && (
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={updateConfigMutation.isPending || deleteConfigMutation.isPending}
                                className="w-full sm:w-auto justify-center"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Delete Configuration</span>
                                <span className="sm:hidden">Delete</span>
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit}
                            disabled={updateConfigMutation.isPending || isLoadingConfig || deleteConfigMutation.isPending}
                            className="w-full sm:w-auto justify-center"
                        >
                            {updateConfigMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">Saving...</span>
                                    <span className="sm:hidden">Save...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Save Configuration</span>
                                    <span className="sm:hidden">Save</span>
                                </>
                            )}
                        </Button>
                    </div>
                }
            />

            <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
                {isLoadingConfig ? (
                    <ConfigurationSkeleton />
                ) : (
                    <div className="space-y-8">
                        {/* Current Configuration Summary */}
                        {config && (
                            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                                <CardHeader className="p-4 lg:p-6">
                                    <CardTitle className="flex items-center gap-3 text-foreground text-base lg:text-lg">
                                        <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary text-primary-foreground">
                                            <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />
                                        </div>
                                        <span className="hidden sm:inline">Configuration Overview</span>
                                        <span className="sm:hidden">Overview</span>
                                    </CardTitle>
                                    <CardDescription className="text-sm lg:text-base">
                                        <span className="hidden sm:inline">Current settings overview for your branch scheduling system</span>
                                        <span className="sm:hidden">Current settings overview</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 lg:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                        <div className="bg-card p-3 lg:p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="text-lg lg:text-2xl font-bold text-primary mb-1">{config.maxShiftsPerWeek}</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground font-medium">Max Shifts/Week</div>
                                        </div>
                                        <div className="bg-card p-3 lg:p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="text-lg lg:text-2xl font-bold text-secondary-foreground mb-1">{config.maxShiftsPerDay}</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground font-medium">Max Shifts/Day</div>
                                        </div>
                                        <div className="bg-card p-3 lg:p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="text-lg lg:text-2xl font-bold text-accent-foreground mb-1">{config.minRestHoursBetweenShifts}h</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground font-medium">Min Rest Time</div>
                                        </div>
                                        <div className="bg-card p-3 lg:p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="text-lg lg:text-2xl font-bold text-gold-600 mb-1">{config.responseDeadlineHours}h</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground font-medium">Response Deadline</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4 lg:mt-6 pt-3 lg:pt-4 border-t">
                                        <Badge variant={config.allowSelfShiftRegistration ? "default" : "secondary"} className="text-xs">
                                            {config.allowSelfShiftRegistration ? 'Self Registration Enabled' : 'Self Registration Disabled'}
                                        </Badge>
                                        <Badge variant={config.autoAssignEnabled ? "default" : "secondary"} className="text-xs">
                                            {config.autoAssignEnabled ? 'Auto Assignment On' : 'Manual Assignment'}
                                        </Badge>
                                        <Badge variant={config.requireManagerApproval ? "default" : "secondary"} className="text-xs">
                                            {config.requireManagerApproval ? 'Manager Approval Required' : 'No Approval Required'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Self Shift Registration */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg p-4 lg:p-6">
                                <CardTitle className="flex items-center gap-3 text-foreground text-base lg:text-lg">
                                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary text-primary-foreground">
                                        <CalendarCheck className="h-4 w-4 lg:h-5 lg:w-5" />
                                    </div>
                                    <span className="hidden sm:inline">Self Shift Registration</span>
                                    <span className="sm:hidden">Self Registration</span>
                                </CardTitle>
                                <CardDescription className="text-sm lg:text-base">
                                    <span className="hidden sm:inline">Allow employees to register for available shifts independently</span>
                                    <span className="sm:hidden">Employee self-registration for shifts</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-xl border space-y-2 sm:space-y-0">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium text-foreground">Enable Self Registration</Label>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="hidden sm:inline">Allow employees to register for open shifts</span>
                                            <span className="sm:hidden">Employee self-registration</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-center sm:justify-end">
                                        <Switch
                                            checked={formData.allowSelfShiftRegistration}
                                            onCheckedChange={(checked) => handleInputChange('allowSelfShiftRegistration', checked)}
                                        />
                                    </div>
                                </div>

                                {formData.allowSelfShiftRegistration && (
                                    <div className="space-y-6 pl-4 lg:pl-6 border-l-2 border-accent/30 bg-accent/5 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-foreground">Registration Start Day</Label>
                                                <Select
                                                    value={formData.registrationStartDayOfWeek?.toString()}
                                                    onValueChange={(value) => handleInputChange('registrationStartDayOfWeek', parseInt(value))}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select start day" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DAYS_OF_WEEK.map((day) => (
                                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                                {day.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-foreground">Registration End Day</Label>
                                                <Select
                                                    value={formData.registrationEndDayOfWeek?.toString()}
                                                    onValueChange={(value) => handleInputChange('registrationEndDayOfWeek', parseInt(value))}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select end day" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DAYS_OF_WEEK.map((day) => (
                                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                                {day.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="registrationDaysInAdvance" className="text-sm font-medium text-foreground">
                                                Registration Days in Advance
                                            </Label>
                                            <Input
                                                id="registrationDaysInAdvance"
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={formData.registrationDaysInAdvance ?? ''}
                                                onChange={(e) => handleInputChange('registrationDaysInAdvance', parseInt(e.target.value) || 7)}
                                                className="h-11"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                How many days in advance employees can register for shifts (1-30 days)
                                            </p>
                                        </div>

                                        <Alert className="bg-accent/10 border-accent/30">
                                            <Info className="h-4 w-4 text-accent-foreground" />
                                            <AlertDescription className="text-accent-foreground text-sm">
                                                <strong>Registration Window:</strong>
                                                <span className="hidden sm:inline"> Employees can register from{' '}
                                                    <strong>{DAYS_OF_WEEK.find(d => d.value === formData.registrationStartDayOfWeek)?.label}</strong> to{' '}
                                                    <strong>{DAYS_OF_WEEK.find(d => d.value === formData.registrationEndDayOfWeek)?.label}</strong> for shifts{' '}
                                                    <strong>{formData.registrationDaysInAdvance} days</strong> in advance.</span>
                                                <span className="sm:hidden"><br />
                                                    <strong>{DAYS_OF_WEEK.find(d => d.value === formData.registrationStartDayOfWeek)?.label}</strong> to{' '}
                                                    <strong>{DAYS_OF_WEEK.find(d => d.value === formData.registrationEndDayOfWeek)?.label}</strong>, {formData.registrationDaysInAdvance} days ahead.</span>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Separator className="my-6 lg:my-8" />

                        {/* Shift Limits */}
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg p-4 lg:p-6">
                                <CardTitle className="flex items-center gap-3 text-foreground text-base lg:text-lg">
                                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary text-primary-foreground">
                                        <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                                    </div>
                                    <span className="hidden sm:inline">Shift Limits & Restrictions</span>
                                    <span className="sm:hidden">Shift Limits</span>
                                </CardTitle>
                                <CardDescription className="text-sm lg:text-base">
                                    <span className="hidden sm:inline">Set maximum limits and minimum rest periods to ensure work-life balance</span>
                                    <span className="sm:hidden">Set limits and rest periods</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 p-4 lg:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="maxShiftsPerWeek" className="text-sm font-medium text-foreground">
                                            Max Shifts per Week
                                        </Label>
                                        <Input
                                            id="maxShiftsPerWeek"
                                            type="number"
                                            min="1"
                                            value={formData.maxShiftsPerWeek ?? ''}
                                            onChange={(e) => handleInputChange('maxShiftsPerWeek', parseInt(e.target.value) || 5)}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">Maximum shifts per employee per week</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="maxShiftsPerDay" className="text-sm font-medium text-foreground">
                                            Max Shifts per Day
                                        </Label>
                                        <Input
                                            id="maxShiftsPerDay"
                                            type="number"
                                            min="1"
                                            value={formData.maxShiftsPerDay ?? ''}
                                            onChange={(e) => handleInputChange('maxShiftsPerDay', parseInt(e.target.value) || 2)}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">Maximum shifts per employee per day</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="minRestHours" className="text-sm font-medium text-foreground">
                                            Min Rest Hours
                                        </Label>
                                        <Input
                                            id="minRestHours"
                                            type="number"
                                            min="0"
                                            max="24"
                                            value={formData.minRestHoursBetweenShifts ?? ''}
                                            onChange={(e) => handleInputChange('minRestHoursBetweenShifts', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">Minimum hours between shifts</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="responseDeadlineHours" className="text-sm font-medium text-foreground">
                                            Response Deadline (Hours)
                                        </Label>
                                        <Input
                                            id="responseDeadlineHours"
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={formData.responseDeadlineHours ?? ''}
                                            onChange={(e) => handleInputChange('responseDeadlineHours', parseInt(e.target.value) || 24)}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            <span className="hidden sm:inline">Time limit for employees to respond to shift assignments</span>
                                            <span className="sm:hidden">Response time limit</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator className="my-6 lg:my-8" />

                        {/* Assignment Settings */}
                        {/* <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-foreground">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    Assignment & Management
                                </CardTitle>
                                <CardDescription>
                                    Configure how shifts are assigned and managed within your branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium text-foreground">Auto Assignment</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Automatically assign shifts to suitable employees
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.autoAssignEnabled}
                                        onCheckedChange={(checked) => handleInputChange('autoAssignEnabled', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium text-foreground">Allow Self Assignment</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Employees can assign themselves to open shifts
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.allowSelfAssignment}
                                        onCheckedChange={(checked) => handleInputChange('allowSelfAssignment', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium text-foreground">Enable Shift Swap</Label>
                                        <div className="text-sm text-muted-foreground">
                                            Allow employees to swap shifts with each other
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.enableShiftSwap}
                                        onCheckedChange={(checked) => handleInputChange('enableShiftSwap', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card> */}

                        {/* Approval Settings */}
                        {/* <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
                                <CardTitle className="flex items-center gap-3 text-foreground">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive text-destructive-foreground">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    Approval & Authorization
                                </CardTitle>
                                <CardDescription>
                                    Control approval workflows for schedule changes and assignments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium text-foreground">Require Manager Approval</Label>
                                        <div className="text-sm text-muted-foreground">
                                            All schedule changes must be approved by a manager
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.requireManagerApproval}
                                        onCheckedChange={(checked) => handleInputChange('requireManagerApproval', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card> */}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto m-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive text-lg">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Configuration
                            </DialogTitle>
                            <DialogDescription className="text-base leading-relaxed">
                                <span className="hidden sm:inline">Are you sure you want to delete this schedule configuration? This action cannot be undone and will reset all scheduling rules to default values.</span>
                                <span className="sm:hidden">Delete this configuration? This action cannot be undone and will reset all rules to default.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteConfigMutation.isPending}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteConfigMutation.isPending}
                                className="w-full sm:w-auto"
                            >
                                {deleteConfigMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span className="hidden sm:inline">Deleting...</span>
                                        <span className="sm:hidden">Delete...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Delete Configuration</span>
                                        <span className="sm:hidden">Delete</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function ScheduleConfigurationPage() {
    return (
        <ProtectedRoute requiredRoles={Role.MANAGER}>
            <ScheduleConfiguration />
        </ProtectedRoute>
    );
}