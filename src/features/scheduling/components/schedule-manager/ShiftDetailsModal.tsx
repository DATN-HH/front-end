import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ShiftDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    shifts: any[]
    employeeName: string
    date: string
    onDelete: (shiftId: number) => void
    onAddShift: () => void
    onShiftClick: (shift: any) => void
}

const ShiftDetailsModal = ({
    isOpen,
    onClose,
    shifts,
    employeeName,
    date,
    onDelete,
    onAddShift,
    onShiftClick
}: ShiftDetailsModalProps) => {
    const statusConfig = {
        DRAFT: { color: "bg-yellow-500", text: "text-white", label: "Draft" },
        CONFIRMED: { color: "bg-green-500", text: "text-white", label: "Confirmed" },
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Shift Details</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">{employeeName}</h3>
                            <p className="text-sm text-gray-500">{date}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {shifts.map((shift) => (
                                <div
                                    key={shift.id}
                                    className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onShiftClick(shift)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{shift.name}</p>
                                            <p className="text-sm text-gray-500">{shift.time}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(shift.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Badge className={statusConfig[shift.status as keyof typeof statusConfig]?.color}>
                                        {statusConfig[shift.status as keyof typeof statusConfig]?.label}
                                    </Badge>
                                </div>
                            ))}
                            {/* Add Shift Card */}
                            <div
                                className="p-3 rounded-lg border border-dashed border-gray-300 hover:bg-gray-50 cursor-pointer flex items-center justify-center h-[88px]"
                                onClick={onAddShift}
                            >
                                <div className="text-center">
                                    <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-sm text-gray-500">Add Shift</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShiftDetailsModal 