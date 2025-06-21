'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import {
    Brain,
    Clock,
    User,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Calendar,
    Users,
    ChevronDown,
    ChevronRight,
    UserPlus
} from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
import {
    useShiftAssignmentSuggestions,
    ShiftAssignmentSuggestionRequest,
    ShiftAssignmentSuggestionResponse,
    StaffSuggestion
} from '@/api/v1/shift-assignments';
import { useCreateStaffShift } from '@/api/v1/staff-shifts';
import { useQueryClient } from '@tanstack/react-query';

interface ShiftAssignmentSuggestionsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShiftAssignmentSuggestions({ open, onOpenChange }: ShiftAssignmentSuggestionsProps) {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const branchId = user?.branch?.id;
    const queryClient = useQueryClient();

    const suggestionMutation = useShiftAssignmentSuggestions();
    const createStaffShiftMutation = useCreateStaffShift();

    const [requestForm, setRequestForm] = useState<ShiftAssignmentSuggestionRequest>({
        branchId: branchId!,
        startDate: '',
        endDate: '',
        useAI: false, // This will always be false but kept for API compatibility
        maxSuggestionsPerShift: 3,
    });

    const [suggestions, setSuggestions] = useState<ShiftAssignmentSuggestionResponse[]>([]);
    const [expandedShifts, setExpandedShifts] = useState<Set<number>>(new Set());

    const handleInputChange = (field: keyof ShiftAssignmentSuggestionRequest, value: any) => {
        setRequestForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGetSuggestions = async () => {
        if (!requestForm.startDate || !requestForm.endDate) {
            error('Validation Error', 'Please select start and end dates');
            return;
        }

        if (new Date(requestForm.startDate) > new Date(requestForm.endDate)) {
            error('Validation Error', 'Start date must be before end date');
            return;
        }

        try {
            const result = await suggestionMutation.mutateAsync(requestForm);
            setSuggestions(result);
            success('Suggestions Generated', `Generated suggestions for ${result.length} shifts`);
        } catch (err: any) {
            error('Generation Failed', err.response?.data?.message || 'Failed to generate suggestions');
        }
    };

    const toggleShiftExpansion = (shiftId: number) => {
        setExpandedShifts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(shiftId)) {
                newSet.delete(shiftId);
            } else {
                newSet.add(shiftId);
            }
            return newSet;
        });
    };

    const handleClose = () => {
        onOpenChange(false);
        setSuggestions([]);
        setExpandedShifts(new Set());
        setRequestForm({
            branchId: branchId!,
            startDate: '',
            endDate: '',
            useAI: false,
            maxSuggestionsPerShift: 3,
        });
    };

    const handleCreateShift = async (staff: StaffSuggestion, scheduledShiftId: number, shiftName: string) => {
        try {
            await createStaffShiftMutation.mutateAsync({
                staffId: staff.staffId,
                scheduledShiftId: scheduledShiftId,
                shiftStatus: 'DRAFT',
            });

            // Invalidate and refetch queries to update the UI
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] }),
                queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
                queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
            ]);

            // Refresh suggestions to show updated data
            if (requestForm.startDate && requestForm.endDate) {
                try {
                    const refreshedSuggestions = await suggestionMutation.mutateAsync(requestForm);
                    setSuggestions(refreshedSuggestions);
                } catch (refreshError) {
                    console.warn('Failed to refresh suggestions:', refreshError);
                }
            }

            success('Shift Created', `Successfully created shift for ${staff.staffName} - ${shiftName}`);
        } catch (err: any) {
            error('Creation Failed', err.response?.data?.message || 'Failed to create shift');
        }
    };

    const renderStaffSuggestion = (staff: StaffSuggestion, index: number, scheduledShiftId?: number, shiftName?: string) => {
        return (
            <Card key={staff.staffId} className={`${index === 0 ? 'border-accent bg-accent/10' : 'border-border bg-card'} hover:shadow-md transition-shadow`}>
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-border">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    <AvatarInitials name={staff.staffName} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <div className="font-semibold text-foreground">{staff.staffName}</div>
                                <div className="text-sm text-muted-foreground">{staff.roleName}</div>
                                <div className="text-xs text-muted-foreground">
                                    Current week shifts: {staff.currentWeekShifts}
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge variant={staff.isAvailable ? "default" : "secondary"}>
                                {staff.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                            {scheduledShiftId && shiftName && (
                                <div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleCreateShift(staff, scheduledShiftId, shiftName)}
                                        disabled={createStaffShiftMutation.isPending}
                                        className="gap-2 h-8 text-xs"
                                    >
                                        {createStaffShiftMutation.isPending ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-3 w-3" />
                                        )}
                                        Create Shift
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="text-sm text-foreground bg-muted px-3 py-2 rounded-lg">
                            <strong className="text-foreground">Reason:</strong> {staff.reasonForSuggestion}
                        </div>
                        {staff.warnings.length > 0 && (
                            <div className="flex items-start gap-2 bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-destructive">
                                    <strong>Warnings:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {staff.warnings.map((warning, idx) => (
                                            <li key={idx}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {index === 0 && (
                        <div className="mt-4 pt-4 border-t border-accent">
                            <div className="flex items-center gap-2 text-sm text-accent-foreground bg-accent/20 px-3 py-2 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Recommended Assignment</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (!branchId) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Brain className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Shift Assignment Suggestions</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Generate intelligent staff assignment suggestions for your shifts
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* Request Form */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                Generate Suggestions
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Configure parameters for generating assignment suggestions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="startDate" className="text-sm font-medium text-foreground">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={requestForm.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="h-11 bg-white "
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="endDate" className="text-sm font-medium text-foreground">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={requestForm.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="h-11 bg-white "
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="maxSuggestions" className="text-sm font-medium text-foreground">Max Suggestions per Shift</Label>
                                <Input
                                    id="maxSuggestions"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={requestForm.maxSuggestionsPerShift || ''}
                                    onChange={(e) => handleInputChange('maxSuggestionsPerShift', parseInt(e.target.value) || 3)}
                                    className="max-w-xs h-11 bg-white"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Number of staff suggestions to generate per shift
                                </p>
                            </div>

                            <Button
                                onClick={handleGetSuggestions}
                                disabled={suggestionMutation.isPending}
                                className="w-full h-12 font-medium"
                            >
                                {suggestionMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating Suggestions...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="mr-2 h-5 w-5" />
                                        Generate Suggestions
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Suggestions Results */}
                    {suggestions.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Assignment Suggestions ({suggestions.length} shifts)
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {suggestions.map((suggestion) => {
                                    const isExpanded = expandedShifts.has(suggestion.scheduledShiftId);
                                    return (
                                        <Card key={suggestion.scheduledShiftId} className="border-2 hover:border-primary/50 transition-colors">
                                            <CardHeader
                                                className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
                                                onClick={() => toggleShiftExpansion(suggestion.scheduledShiftId)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 text-primary">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronRight className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                                                    <Clock className="h-4 w-4" />
                                                                </div>
                                                                {suggestion.shiftName}
                                                            </CardTitle>
                                                            <CardDescription className="mt-2 text-muted-foreground">
                                                                {format(new Date(suggestion.date), 'EEEE, MMMM dd, yyyy')} • {suggestion.startTime} - {suggestion.endTime}
                                                            </CardDescription>
                                                            {suggestion.assignmentReason && (
                                                                <div className="text-sm text-foreground mt-3 bg-muted px-3 py-2 rounded-lg">
                                                                    <strong>Assignment Reason:</strong> {suggestion.assignmentReason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                                                        {suggestion.suggestedStaff.length} suggestions
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            {isExpanded && (
                                                <CardContent className="pt-0 bg-muted/30">
                                                    <div className="space-y-4">
                                                        {suggestion.suggestedStaff.map((staff, index) =>
                                                            renderStaffSuggestion(staff, index, suggestion.scheduledShiftId, suggestion.shiftName)
                                                        )}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {suggestions.length === 0 && !suggestionMutation.isPending && (
                        <Card className="border-2 border-dashed border-muted">
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center text-muted-foreground">
                                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                        <Brain className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">No suggestions generated yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure the parameters above and click "Generate Suggestions" to get started
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-8 h-11"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 