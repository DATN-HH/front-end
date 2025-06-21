import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, AlertTriangle, Loader2, Trash } from 'lucide-react';
import { ShiftResponseDto } from '@/api/v1/shifts';

interface DeleteShiftModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    shift: ShiftResponseDto | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function DeleteShiftModal({
    isOpen,
    onOpenChange,
    shift,
    onConfirm,
    isLoading = false,
}: DeleteShiftModalProps) {
    if (!shift) return null;

    const formatTime = (time: any) => {
        if (typeof time === 'string') {
            return time.substring(0, 5);
        }
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    const getDayAbbreviation = (day: string) => {
        const dayAbbreviations = {
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat',
            'Sunday': 'Sun'
        };
        return dayAbbreviations[day] || day;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Delete Shift</DialogTitle>
                            <DialogDescription className="mt-1">
                                This action cannot be undone. This will permanently delete the shift
                                and remove all associated data.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium text-lg">{shift.name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-secondary-foreground" />
                                <span>
                                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {shift.weekDays.map((day, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 bg-accent/10 text-accent-foreground border-accent/20"
                                    >
                                        {getDayAbbreviation(day)}
                                    </Badge>
                                ))}
                            </div>

                            {shift.requirements && shift.requirements.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {shift.requirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                                            <span>{req.role}</span>
                                            <span className="bg-primary/20 text-primary px-1 py-0.5 rounded text-xs font-medium">
                                                {req.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {shift.branchName && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Branch:</span> {shift.branchName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-destructive">
                                <p className="font-medium mb-1">This action cannot be undone</p>
                                <p>All scheduled shifts using this template will be affected.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Shift
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 