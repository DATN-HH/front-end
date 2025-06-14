import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';

export function EditStaffShiftModal({
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedStaffShift,
    setSelectedStaffShift,
    shifts,
    handleUpdateStaffShift,
    mockStaff,
}: any) {
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Shift Assignment</DialogTitle>
                    <DialogDescription>
                        Update the details of this shift assignment.
                    </DialogDescription>
                </DialogHeader>

                {selectedStaffShift && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedStaffShift.date
                                                ? format(
                                                    parseISO(
                                                        selectedStaffShift.date
                                                    ),
                                                    'PPP'
                                                )
                                                : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                selectedStaffShift.date
                                                    ? parseISO(
                                                        selectedStaffShift.date
                                                    )
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setSelectedStaffShift(
                                                    (prev) => {
                                                        if (!prev) return null;
                                                        return {
                                                            ...prev,
                                                            date: date
                                                                ? format(
                                                                    date,
                                                                    'yyyy-MM-dd'
                                                                )
                                                                : prev.date,
                                                        };
                                                    }
                                                )
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Shift
                                </label>
                                <Select
                                    value={selectedStaffShift.shift.id.toString()}
                                    onValueChange={(value) => {
                                        const newShift = shifts.find(
                                            (s) => s.id?.toString() === value
                                        );
                                        if (newShift) {
                                            setSelectedStaffShift((prev) => {
                                                if (!prev) return null;
                                                return {
                                                    ...prev,
                                                    shift: {
                                                        id: newShift.id as number,
                                                        startTime:
                                                            newShift.startTime,
                                                        endTime:
                                                            newShift.endTime,
                                                        branchName:
                                                            newShift.branchName ||
                                                            '',
                                                        requirements:
                                                            newShift.requirements.map(
                                                                (r) => ({
                                                                    role: r.role,
                                                                    quantity:
                                                                        r.quantity,
                                                                })
                                                            ),
                                                    },
                                                };
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((shift) => (
                                            <SelectItem
                                                key={shift.id}
                                                value={
                                                    shift.id?.toString() || ''
                                                }
                                            >
                                                {shift.startTime.substring(
                                                    0,
                                                    5
                                                )}{' '}
                                                -{' '}
                                                {shift.endTime.substring(0, 5)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Staff</label>
                            <Select
                                value={selectedStaffShift.staff.id.toString()}
                                onValueChange={(value) => {
                                    const newStaff = mockStaff.find(
                                        (s) => s.id.toString() === value
                                    );
                                    if (newStaff) {
                                        setSelectedStaffShift((prev) => {
                                            if (!prev) return null;
                                            return {
                                                ...prev,
                                                staff: newStaff,
                                            };
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockStaff.map((staff) => (
                                        <SelectItem
                                            key={staff.id}
                                            value={staff.id.toString()}
                                        >
                                            {staff.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Note</label>
                            <Textarea
                                placeholder="Add a note for this shift"
                                value={selectedStaffShift.note}
                                onChange={(e) =>
                                    setSelectedStaffShift((prev) => {
                                        if (!prev) return null;
                                        return {
                                            ...prev,
                                            note: e.target.value,
                                        };
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Status
                            </label>
                            <Select
                                value={selectedStaffShift.shiftStatus}
                                onValueChange={(value) =>
                                    setSelectedStaffShift((prev) => {
                                        if (!prev) return null;
                                        return {
                                            ...prev,
                                            shiftStatus: value,
                                        };
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PUBLISHED">
                                        Published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStaffShift}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 