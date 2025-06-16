import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CreateOpenShiftProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (shiftData: any) => void
}

const CreateOpenShift = ({ isOpen, onClose, onAdd }: CreateOpenShiftProps) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const shiftData = {
            name: formData.get("shiftType"),
            time: formData.get("timeSlot"),
            status: "DRAFT",
        }
        onAdd(shiftData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Open Shift</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shiftType">Shift Type</Label>
                        <Select name="shiftType" required>
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
                        <Label htmlFor="timeSlot">Time Slot</Label>
                        <Select name="timeSlot" required>
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
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Open Shift</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateOpenShift 