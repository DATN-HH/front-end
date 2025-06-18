import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScheduleContext } from "../../contexts/context-schedule"
import { useContext, useMemo, useState } from "react"
import { Plus, Users, Clock, MapPin, Trash2 } from "lucide-react"
import { useDeleteScheduledShift } from "@/api/v1/scheduled-shift"
import { useDeleteStaffShift } from "@/api/v1/staff-shifts"
import { useQueryClient } from "@tanstack/react-query"
import { useCustomToast } from "@/lib/show-toast"
import dayjs from "dayjs"

const ShiftInfoModal = () => {
    const [deletingShiftId, setDeletingShiftId] = useState<number | null>(null)
    const { success: successToast, error: errorToast } = useCustomToast()
    const queryClient = useQueryClient()

    const {
        isShiftInfoModalOpen,
        setIsShiftInfoModalOpen,
        shiftInfoModalType,
        selectedDate,
        selectedStaffName,
        scheduledShifts,
        isLoadingScheduledShifts,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
        roles,
        isLoadingRoles,
        setIsCreateOpenShiftDialogOpen,
        setIsAddShiftModalOpen
    } = useContext(ScheduleContext)

    const deleteScheduledShiftMutation = useDeleteScheduledShift()
    const deleteStaffShiftMutation = useDeleteStaffShift()

    const statusConfig = {
        DRAFT: { color: "bg-yellow-500", text: "text-white", label: "Draft" },
        PUBLISHED: { color: "bg-green-500", text: "text-white", label: "Published" },
    }

    // Get open shifts for selected date
    const openShiftsForDate = useMemo(() => {
        if (!scheduledShifts || isLoadingScheduledShifts) return []

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")
        return scheduledShifts.filter((shift: any) =>
            shift.date === dateStr && (!shift.staffId || shift.staffId === null)
        )
    }, [scheduledShifts, selectedDate, isLoadingScheduledShifts])

    // Get employee shifts for selected date and staff using new structure
    const employeeShiftsForDate = useMemo(() => {
        if (!staffShiftsGrouped || !selectedStaffName || isLoadingStaffShiftsGrouped) return []

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")
        const shifts: any[] = []

        // Search through all roles to find the staff member
        Object.keys(staffShiftsGrouped.data).forEach(roleName => {
            const roleData = staffShiftsGrouped.data[roleName]
            if (roleData[selectedStaffName] && roleData[selectedStaffName].shifts[dateStr]) {
                shifts.push(...roleData[selectedStaffName].shifts[dateStr])
            }
        })

        return shifts
    }, [staffShiftsGrouped, selectedStaffName, selectedDate, isLoadingStaffShiftsGrouped])

    // Get staff role using new structure
    const getStaffRole = useMemo(() => {
        if (!staffShiftsGrouped || !selectedStaffName || isLoadingStaffShiftsGrouped) return null

        for (const roleName of Object.keys(staffShiftsGrouped.data)) {
            const roleData = staffShiftsGrouped.data[roleName]
            if (roleData[selectedStaffName]) {
                return roleName
            }
        }
        return null
    }, [staffShiftsGrouped, selectedStaffName, isLoadingStaffShiftsGrouped])

    // Get registered staff count for open shifts
    const getRegisteredStaffCount = (shift: any) => {
        if (!staffShiftsGrouped) return { total: 0, byRole: [] }

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")
        let totalRegistered = 0
        const roleBreakdown: any[] = []

        // Count staff registered for this shift across all roles using new structure
        Object.keys(staffShiftsGrouped.data).forEach(roleName => {
            const roleData = staffShiftsGrouped.data[roleName]
            let roleCount = 0

            Object.keys(roleData).forEach(staffName => {
                const staffShifts = roleData[staffName].shifts[dateStr] || []
                const hasShift = staffShifts.some((s: any) =>
                    s.startTime === shift.startTime && s.endTime === shift.endTime
                )
                if (hasShift) {
                    roleCount++
                    totalRegistered++
                }
            })

            if (roleCount > 0) {
                roleBreakdown.push({ role: roleName, count: roleCount })
            }
        })

        return { total: totalRegistered, byRole: roleBreakdown }
    }

    const handleClose = () => {
        setIsShiftInfoModalOpen(false)
    }

    const handleAddClick = () => {
        if (shiftInfoModalType === "open-shift") {
            setIsCreateOpenShiftDialogOpen(true)
        } else if (shiftInfoModalType === "employee-shift") {
            setIsAddShiftModalOpen(true)
        }
        setIsShiftInfoModalOpen(false)
    }

    const handleDeleteOpenShift = async (shiftId: number, shiftName: string) => {
        try {
            setDeletingShiftId(shiftId)
            await deleteScheduledShiftMutation.mutateAsync(shiftId)

            // Invalidate related queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
            await queryClient.invalidateQueries({ queryKey: ['scheduled-shifts-grouped'] })
            await queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] })

            successToast(
                "Open shift deleted successfully",
                `${shiftName} for ${dayjs(selectedDate).format("DD/MM/YYYY")} has been deleted`
            )
        } catch (error: any) {
            console.error('Error deleting open shift:', error)
            errorToast(
                "Failed to delete open shift",
                error?.response?.data?.message || error?.message || "An error occurred while deleting the shift"
            )
        } finally {
            setDeletingShiftId(null)
        }
    }

    const handleDeleteEmployeeShift = async (shiftId: number, shiftName: string) => {
        try {
            setDeletingShiftId(shiftId)
            await deleteStaffShiftMutation.mutateAsync(shiftId)

            // Invalidate related queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] })
            await queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })

            successToast(
                "Employee shift deleted successfully",
                `${selectedStaffName}'s ${shiftName} for ${dayjs(selectedDate).format("DD/MM/YYYY")} has been deleted`
            )
        } catch (error: any) {
            console.error('Error deleting employee shift:', error)
            errorToast(
                "Failed to delete employee shift",
                error?.response?.data?.message || error?.message || "An error occurred while deleting the shift"
            )
        } finally {
            setDeletingShiftId(null)
        }
    }

    const isLoading = isLoadingScheduledShifts || isLoadingStaffShiftsGrouped || isLoadingRoles

    const renderOpenShiftInfo = () => {
        if (openShiftsForDate.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">No open shifts found for the selected date</div>
                    <Button onClick={handleAddClick} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Open Shift
                    </Button>
                </div>
            )
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">
                        Open Shifts - {dayjs(selectedDate).format("DD/MM/YYYY")}
                    </div>
                    <Button onClick={handleAddClick} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Open Shift
                    </Button>
                </div>

                <div className="grid gap-4">
                    {openShiftsForDate.map((shift: any, index: number) => {
                        const registeredInfo = getRegisteredStaffCount(shift)

                        return (
                            <Card key={shift.id || index} className="border">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{shift.shiftName}</CardTitle>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    disabled={deletingShiftId === shift.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Open Shift</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the open shift "{shift.shiftName}" for {dayjs(selectedDate).format("DD/MM/YYYY")}?
                                                        This will remove all related shifts for this date and cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteOpenShift(shift.id, shift.shiftName)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>
                                            {shift.startTime && shift.endTime
                                                ? `${shift.startTime} - ${shift.endTime}`
                                                : "Time not set"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{shift.branchName}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span>Registered: {registeredInfo.total} staff</span>
                                        </div>

                                        {shift.requirements && shift.requirements.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-700">Requirements:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {shift.requirements.map((req: any, reqIndex: number) => {
                                                        const registered = registeredInfo.byRole.find(r => r.role === req.role)?.count || 0
                                                        const isComplete = registered >= req.quantity

                                                        return (
                                                            <Badge
                                                                key={reqIndex}
                                                                variant={isComplete ? "default" : "secondary"}
                                                                className={isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                                                            >
                                                                {req.role}: {registered}/{req.quantity}
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderEmployeeShiftInfo = () => {
        if (employeeShiftsForDate.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                        {selectedStaffName} has no shifts on the selected date
                    </div>
                    <Button onClick={handleAddClick} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Register for Shift
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">
                        {selectedStaffName}'s Shifts - {dayjs(selectedDate).format("DD/MM/YYYY")}
                    </div>
                    <Button onClick={handleAddClick} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Register More Shifts
                    </Button>
                </div>

                <div className="grid gap-4">
                    {employeeShiftsForDate.map((shift: any, index: number) => (
                        <Card key={shift.id || index} className="border">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{shift.shiftName}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusConfig[shift.shiftStatus as keyof typeof statusConfig]?.color || statusConfig.DRAFT.color}>
                                            {statusConfig[shift.shiftStatus as keyof typeof statusConfig]?.label || statusConfig.DRAFT.label}
                                        </Badge>
                                        {shift.shiftStatus === "DRAFT" && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        disabled={deletingShiftId === shift.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Employee Shift</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete {selectedStaffName}'s "{shift.shiftName}" shift for {dayjs(selectedDate).format("DD/MM/YYYY")}?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteEmployeeShift(shift.staffShiftId, shift.shiftName)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>
                                        {shift.startTime && shift.endTime
                                            ? `${shift.startTime} - ${shift.endTime}`
                                            : "Time not set"
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>Role: {getStaffRole}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{shift.branchName}</span>
                                </div>

                                {shift.note && (
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">Note: </span>
                                        <span className="text-gray-600">{shift.note}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const getModalTitle = () => {
        if (shiftInfoModalType === "open-shift") {
            return "Open Shift Information"
        } else if (shiftInfoModalType === "employee-shift") {
            return "Employee Shift Information"
        }
        return "Shift Information"
    }

    return (
        <Dialog open={isShiftInfoModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getModalTitle()}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading...</div>
                        </div>
                    ) : (
                        <div>
                            {shiftInfoModalType === "open-shift" && renderOpenShiftInfo()}
                            {shiftInfoModalType === "employee-shift" && renderEmployeeShiftInfo()}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShiftInfoModal 