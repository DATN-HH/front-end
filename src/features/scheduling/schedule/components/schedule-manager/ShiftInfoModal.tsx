import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ShiftInfoModalProps {
    isOpen: boolean
    onClose: () => void
    shift: any
}

const ShiftInfoModal = ({ isOpen, onClose, shift }: ShiftInfoModalProps) => {
    const statusConfig = {
        DRAFT: { color: "bg-yellow-500", text: "text-white", label: "Draft" },
        CONFIRMED: { color: "bg-green-500", text: "text-white", label: "Confirmed" },
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Shift Information</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{shift?.name}</h3>
                            <Badge className={statusConfig[shift?.status as keyof typeof statusConfig]?.color}>
                                {statusConfig[shift?.status as keyof typeof statusConfig]?.label}
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Time</p>
                                <p className="text-base">{shift?.time}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Employee</p>
                                <p className="text-base">{shift?.staffName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Role</p>
                                <p className="text-base">{shift?.roleName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Branch</p>
                                <p className="text-base">{shift?.branchName}</p>
                            </div>
                            {shift?.note && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Note</p>
                                    <p className="text-base">{shift?.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShiftInfoModal 