import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddShiftModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (shiftData: any) => void
}

const AddShiftModal = ({ isOpen, onClose, onAdd }: AddShiftModalProps) => {
    const shiftTypes = [
        { value: "shift1", label: "Shift 1" },
        { value: "shift2", label: "Shift 2" },
        { value: "shift3", label: "Shift 3" },
        { value: "shift6", label: "Shift 6" },
        { value: "double", label: "Double Shift" },
    ]

    const timeSlots = [
        { value: "06:00-14:00", label: "06:00 - 14:00" },
        { value: "08:00-16:00", label: "08:00 - 16:00" },
        { value: "08:00-17:30", label: "08:00 - 17:30" },
        { value: "14:00-22:00", label: "14:00 - 22:00" },
        { value: "17:30-22:00", label: "17:30 - 22:00" },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Shift</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Shift Type</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shift type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time Slot</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((slot) => (
                                        <SelectItem key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={() => onAdd({})}>
                                Add Shift
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddShiftModal 