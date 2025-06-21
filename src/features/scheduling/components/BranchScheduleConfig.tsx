'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Users, Shield, Bell, Loader2, TrendingUp } from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import { useAuth } from '@/contexts/auth-context';
import {
    useBranchScheduleConfig,
    useCreateOrUpdateBranchScheduleConfig,
    useDeleteBranchScheduleConfig,
    BranchScheduleConfigRequest,
    BranchScheduleConfigResponse
} from '@/api/v1/branch-schedule-config';

interface BranchScheduleConfigProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BranchScheduleConfig({ open, onOpenChange }: BranchScheduleConfigProps) {
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
        autoAssignEnabled: false,
        requireManagerApproval: true,
        allowSelfAssignment: true,
        enableShiftSwap: true,
    });

    useEffect(() => {
        if (config) {
            setFormData({
                branchId: config.branchId,
                maxShiftsPerWeek: config.maxShiftsPerWeek,
                maxShiftsPerDay: config.maxShiftsPerDay,
                minRestHoursBetweenShifts: config.minRestHoursBetweenShifts,
                autoAssignEnabled: config.autoAssignEnabled,
                requireManagerApproval: config.requireManagerApproval,
                allowSelfAssignment: config.allowSelfAssignment,
                enableShiftSwap: config.enableShiftSwap,
                notificationSettings: config.notificationSettings,
                assignmentPriorityRules: config.assignmentPriorityRules,
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
            onOpenChange(false);
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
            onOpenChange(false);
        } catch (err: any) {
            error('Delete Failed', err.response?.data?.message || 'Failed to delete configuration');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setShowDeleteConfirm(false);
    };

    if (!branchId) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Schedule Configuration</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Configure scheduling rules and settings for {user?.branch?.name}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {isLoadingConfig ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
                            <span className="text-muted-foreground">Loading configuration...</span>
                        </div>
                    ) : (
                        <>
                            {/* Shift Limits */}
                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        Shift Limits
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Set maximum limits for staff shifts to ensure work-life balance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="maxShiftsPerWeek" className="text-sm font-medium text-foreground">Max Shifts per Week</Label>
                                            <Input
                                                id="maxShiftsPerWeek"
                                                type="number"
                                                min="1"
                                                max="7"
                                                value={formData.maxShiftsPerWeek || ''}
                                                onChange={(e) => handleInputChange('maxShiftsPerWeek', parseInt(e.target.value) || 5)}
                                                className="h-11 bg-white "
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="maxShiftsPerDay" className="text-sm font-medium text-foreground">Max Shifts per Day</Label>
                                            <Input
                                                id="maxShiftsPerDay"
                                                type="number"
                                                min="1"
                                                max="3"
                                                value={formData.maxShiftsPerDay || ''}
                                                onChange={(e) => handleInputChange('maxShiftsPerDay', parseInt(e.target.value) || 2)}
                                                className="h-11 bg-white "
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="minRestHours" className="text-sm font-medium text-foreground">Min Rest Hours Between Shifts</Label>
                                            <Input
                                                id="minRestHours"
                                                type="number"
                                                min="4"
                                                max="24"
                                                value={formData.minRestHoursBetweenShifts || ''}
                                                onChange={(e) => handleInputChange('minRestHoursBetweenShifts', parseInt(e.target.value) || 8)}
                                                className="h-11 bg-white "
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />

                            {/* Assignment Settings */}
                            <Card className="border-2 border-secondary/50 bg-secondary/10">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        Assignment Settings
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Configure how shifts are assigned and managed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 bg-card rounded-lg">
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium text-foreground">Auto Assignment</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Automatically assign shifts to suitable staff
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.autoAssignEnabled}
                                            onCheckedChange={(checked) => handleInputChange('autoAssignEnabled', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium text-foreground">Allow Self Assignment</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Staff can assign themselves to open shifts
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.allowSelfAssignment}
                                            onCheckedChange={(checked) => handleInputChange('allowSelfAssignment', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium text-foreground">Enable Shift Swap</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Allow staff to swap shifts with each other
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.enableShiftSwap}
                                            onCheckedChange={(checked) => handleInputChange('enableShiftSwap', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Approval Settings */}
                            <Card className="border-2 border-accent/50 bg-accent/10">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        Approval Settings
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Control approval workflows for schedule changes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="bg-card rounded-lg">
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                            </Card>

                            {/* Current Settings Summary */}
                            {config && (
                                <Card className="border-2 border-muted bg-muted/30">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted-foreground text-background">
                                                <TrendingUp className="h-4 w-4" />
                                            </div>
                                            Current Settings Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="bg-card rounded-lg">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                                                <div className="text-3xl font-bold text-primary mb-1">{config.maxShiftsPerWeek}</div>
                                                <div className="text-sm text-muted-foreground font-medium">Max shifts/week</div>
                                            </div>
                                            <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                                                <div className="text-3xl font-bold text-secondary-foreground mb-1">{config.maxShiftsPerDay}</div>
                                                <div className="text-sm text-muted-foreground font-medium">Max shifts/day</div>
                                            </div>
                                            <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                                                <div className="text-3xl font-bold text-accent-foreground mb-1">{config.minRestHoursBetweenShifts}h</div>
                                                <div className="text-sm text-muted-foreground font-medium">Min rest time</div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg border border-muted">
                                                <div className="flex justify-center mb-2">
                                                    <Badge variant={config.autoAssignEnabled ? "default" : "secondary"}>
                                                        Auto Assign
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground font-medium">
                                                    {config.autoAssignEnabled ? 'Enabled' : 'Disabled'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <div className="flex w-full justify-between">
                        <div>
                            {config && !showDeleteConfirm && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={updateConfigMutation.isPending || deleteConfigMutation.isPending}
                                    className="px-6 h-11"
                                >
                                    Delete Configuration
                                </Button>
                            )}
                            {showDeleteConfirm && (
                                <div className="flex gap-3">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleteConfigMutation.isPending}
                                        size="sm"
                                        className="h-11 px-6"
                                    >
                                        {deleteConfigMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Confirm Delete'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={deleteConfigMutation.isPending}
                                        size="sm"
                                        className="h-11 px-6"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={updateConfigMutation.isPending || deleteConfigMutation.isPending}
                                className="px-8 h-11"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={updateConfigMutation.isPending || isLoadingConfig || deleteConfigMutation.isPending}
                                className="px-8 h-11 font-medium"
                            >
                                {updateConfigMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Configuration'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 