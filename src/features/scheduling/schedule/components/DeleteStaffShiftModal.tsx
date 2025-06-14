import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function DeleteStaffShiftModal({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedStaffShift,
    handleDeleteStaffShift,
}: any) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this shift assignment?
                    </DialogDescription>
                </DialogHeader>

                {selectedStaffShift && (
                    <div className="py-4">
                        <div className="space-y-2">
                            <p>
                                <span className="font-medium">Staff:</span>{' '}
                                {selectedStaffShift.staff.fullName}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{' '}
                                {format(
                                    parseISO(selectedStaffShift.date),
                                    'MMMM d, yyyy'
                                )}
                            </p>
                            <p>
                                <span className="font-medium">Time:</span>{' '}
                                {selectedStaffShift.shift.startTime.substring(
                                    0,
                                    5
                                )}{' '}
                                -{' '}
                                {selectedStaffShift.shift.endTime.substring(
                                    0,
                                    5
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteStaffShift}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 