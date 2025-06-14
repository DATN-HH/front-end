import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ShiftRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedShift: any;
    newShiftRequest: {
        type: string;
        reason: string;
    };
    onShiftRequestChange: (field: string, value: any) => void;
}

export function ShiftRequestDialog({
    isOpen,
    onClose,
    onSubmit,
    selectedShift,
    newShiftRequest,
    onShiftRequestChange,
}: ShiftRequestDialogProps) {
    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Shift Change</DialogTitle>
                    <DialogDescription>
                        Submit a request to exchange or drop this shift. Your
                        manager will review your request.
                    </DialogDescription>
                </DialogHeader>

                {selectedShift && (
                    <div className="grid gap-4 py-4">
                        <div className="border rounded-md p-4 bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {format(parseISO(selectedShift.date), 'MMM d, yyyy')}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatTime(selectedShift.shift.startTime)} -{' '}
                                    {formatTime(selectedShift.shift.endTime)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Request Type
                            </label>
                            <Select
                                value={newShiftRequest.type}
                                onValueChange={(value) =>
                                    onShiftRequestChange('type', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select request type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXCHANGE">
                                        Shift Exchange
                                    </SelectItem>
                                    <SelectItem value="LEAVE">
                                        Leave Request
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Reason
                            </label>
                            <Textarea
                                placeholder="Please provide a reason for your request"
                                value={newShiftRequest.reason}
                                onChange={(e) =>
                                    onShiftRequestChange('reason', e.target.value)
                                }
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 