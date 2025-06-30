'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Copy, Calendar as CalendarIcon, CheckSquare, Clock, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import { useCopyWeekWithSchedule, CopyWeekWithScheduleRequestDto } from '@/api/v1/staff-shifts';
import { useAuth } from '@/contexts/auth-context';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

interface CopyWeekWithScheduleProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface WeekOption {
    id: string;
    startDate: Date;
    endDate: Date;
    label: string;
}

export function CopyWeekWithSchedule({ open, onOpenChange }: CopyWeekWithScheduleProps) {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const copyWeekMutation = useCopyWeekWithSchedule();

    const [sourceStartDate, setSourceStartDate] = useState<string>('');
    const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
    const [step, setStep] = useState<'select' | 'confirm'>('select');

    // Generate next 8 weeks as static options
    const generateWeekOptions = (): WeekOption[] => {
        const options: WeekOption[] = [];
        const today = new Date();

        for (let i = 1; i <= 8; i++) {
            const weekStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

            options.push({
                id: format(weekStart, 'yyyy-MM-dd'),
                startDate: weekStart,
                endDate: weekEnd,
                label: `Week ${i} (${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')})`
            });
        }

        return options;
    };

    const weekOptions = generateWeekOptions();

    const handleWeekToggle = (weekId: string, checked: boolean) => {
        if (checked) {
            setSelectedWeeks(prev => [...prev, weekId]);
        } else {
            setSelectedWeeks(prev => prev.filter(id => id !== weekId));
        }
    };

    const handleSelectAll = () => {
        if (selectedWeeks.length === weekOptions.length) {
            setSelectedWeeks([]);
        } else {
            setSelectedWeeks(weekOptions.map(w => w.id));
        }
    };

    const handleContinue = () => {
        if (!sourceStartDate) {
            error('Validation Error', 'Please select a source week start date');
            return;
        }

        if (selectedWeeks.length === 0) {
            error('Validation Error', 'Please select at least one target week');
            return;
        }

        setStep('confirm');
    };

    const handleSubmit = async () => {
        if (!user?.branch?.id) {
            error('Error', 'Branch information not found');
            return;
        }

        const requestData: CopyWeekWithScheduleRequestDto = {
            branchId: user.branch.id,
            sourceStartDate: format(startOfWeek(new Date(sourceStartDate), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            targetStartDates: selectedWeeks,
        };

        try {
            const result = await copyWeekMutation.mutateAsync(requestData);

            success(
                'Week Schedule Copied Successfully! 🎉',
                result.message
            );

            handleClose();
        } catch (err: any) {
            error('Copy Failed', err.response?.data?.message || 'Failed to copy week with schedule');
        }
    };

    const handleClose = () => {
        setSourceStartDate('');
        setSelectedWeeks([]);
        setStep('select');
        onOpenChange(false);
    };

    const handleBack = () => {
        setStep('select');
    };

    const sourceWeekLabel = sourceStartDate
        ? `${format(startOfWeek(new Date(sourceStartDate), { weekStartsOn: 1 }), 'MMM dd')} - ${format(endOfWeek(new Date(sourceStartDate), { weekStartsOn: 1 }), 'MMM dd, yyyy')}`
        : null;

    const isFormValid = sourceStartDate && selectedWeeks.length > 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Copy className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Copy Week with Schedule</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                {step === 'select' ? 'Select source and target weeks for copying complete schedules' : 'Confirm your copy operation'}
                            </p>
                        </div>
                    </DialogTitle>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                            step === 'select' ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"
                        )}>
                            1
                        </div>
                        <div className={cn(
                            "h-0.5 w-16 rounded-full",
                            step === 'confirm' ? "bg-primary" : "bg-muted"
                        )} />
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                            step === 'confirm' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            2
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                            {step === 'select' ? 'Select Weeks' : 'Confirm & Copy'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-foreground">{user?.branch?.name}</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {step === 'select' && (
                        <div className="space-y-6">
                            {/* Source Week Selection */}
                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                        Select Source Week
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Choose any date from the week that contains the complete schedule you want to copy (including staff assignments)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sourceDate" className="text-sm font-medium text-foreground">
                                                Source Week Date <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="sourceDate"
                                                type="date"
                                                value={sourceStartDate}
                                                onChange={(e) => setSourceStartDate(e.target.value)}
                                                className="h-11 bg-white "
                                            />
                                        </div>

                                        {sourceWeekLabel && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-foreground">Selected Week Range</Label>
                                                <div className="flex items-center h-11 px-3 rounded-md border">
                                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                                        {sourceWeekLabel}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {sourceStartDate && (
                                        <div className="bg-muted/50 border border-muted rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div className="text-sm text-foreground">
                                                    <div className="font-medium mb-1">What will be copied:</div>
                                                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                                        <li>All scheduled shifts for the selected week</li>
                                                        <li>All staff assignments and schedules</li>
                                                        <li>Existing staff assignments in target weeks will be replaced</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Target Weeks Selection */}
                            <Card className="border-2 border-secondary/50 bg-secondary/10">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                                    <CheckSquare className="h-4 w-4" />
                                                </div>
                                                Select Target Weeks
                                            </CardTitle>
                                            <CardDescription className="text-muted-foreground">
                                                Choose the weeks where you want to copy the complete schedule to
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="text-sm">
                                            {selectedWeeks.length}/{weekOptions.length} selected
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 bg-card rounded-lg">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        className="w-full md:w-auto"
                                    >
                                        {selectedWeeks.length === weekOptions.length ? 'Deselect All' : 'Select All'}
                                    </Button>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {weekOptions.map((week, index) => (
                                            <div
                                                key={week.id}
                                                className={cn(
                                                    "group border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md",
                                                    selectedWeeks.includes(week.id)
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                                )}
                                                onClick={() => handleWeekToggle(week.id, !selectedWeeks.includes(week.id))}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={selectedWeeks.includes(week.id)}
                                                        onCheckedChange={(checked) => handleWeekToggle(week.id, checked as boolean)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium group-hover:text-primary transition-colors">
                                                                {week.label}
                                                            </span>
                                                            {index === 0 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Next Week
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {format(week.startDate, 'EEEE, MMM dd')} - {format(week.endDate, 'EEEE, MMM dd, yyyy')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 'confirm' && (
                        <div className="space-y-6">
                            {/* Confirmation Summary */}
                            <Card className="border-2 border-accent/50 bg-accent/10">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                                            <CheckSquare className="h-4 w-4" />
                                        </div>
                                        Confirm Copy Operation
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Please review the details before proceeding. This action will copy the complete weekly schedule.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="bg-card rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Source Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{user?.branch?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{sourceWeekLabel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Target Weeks</h4>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{selectedWeeks.length} weeks selected</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-muted/50 border border-muted rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="text-sm text-foreground">
                                                <p className="font-medium mb-1">Important Notice:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                                    <li>This will copy ALL scheduled shifts and staff assignments from the source week</li>
                                                    <li>Existing staff assignments in target weeks will be DELETED first</li>
                                                    <li>This operation cannot be undone</li>
                                                    <li>Staff will receive notifications about schedule changes</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Target weeks preview */}
                            <Card className="border-2 border-muted bg-muted/30">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted-foreground text-background">
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                        Target Weeks Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-card rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedWeeks.map((weekId) => {
                                            const week = weekOptions.find(w => w.id === weekId);
                                            if (!week) return null;

                                            return (
                                                <div key={weekId} className="border rounded-lg p-3 bg-primary/5 border-primary/20">
                                                    <div className="font-medium text-sm text-foreground">{week.label}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {format(week.startDate, 'MMM dd')} - {format(week.endDate, 'MMM dd, yyyy')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    {step === 'select' && (
                        <>
                            <Button type="button" variant="outline" onClick={handleClose} className="px-8 h-11">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleContinue}
                                disabled={!isFormValid}
                                className="min-w-[120px] px-8 h-11 font-medium"
                            >
                                Continue
                                <CheckSquare className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {step === 'confirm' && (
                        <>
                            <Button type="button" variant="outline" onClick={handleBack} className="px-8 h-11">
                                Back
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClose} className="px-8 h-11">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={copyWeekMutation.isPending}
                                className="min-w-[140px] px-8 h-11 font-medium"
                            >
                                {copyWeekMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Copying...
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Schedule
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 