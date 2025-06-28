import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"
import { StaffReplacementModal } from "../StaffReplacementModal"
import { useContext, useMemo, useState } from "react"
import { Plus, Users, Clock, MapPin, Trash2, Calendar, User, RefreshCw } from "lucide-react"
import { useDeleteScheduledShift } from "@/api/v1/scheduled-shift"
import { useDeleteStaffShift } from "@/api/v1/staff-shifts"
import { useQueryClient } from "@tanstack/react-query"
import { useCustomToast } from "@/lib/show-toast"
import dayjs from "dayjs"

const ShiftInfoModal = () => {
    const [deletingShiftId, setDeletingShiftId] = useState<number | null>(null)
    const [replacementModalOpen, setReplacementModalOpen] = useState(false)
    const [selectedShiftForReplacement, setSelectedShiftForReplacement] = useState<{
        staffShiftId: number
        currentStaffName: string
        shiftName: string
        shiftDate: string
        shiftTime: string
        shiftStatus: string
    } | null>(null)
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

    const handleOpenReplacementModal = (shift: any) => {
        setSelectedShiftForReplacement({
            staffShiftId: shift.staffShiftId,
            currentStaffName: selectedStaffName || "",
            shiftName: shift.shiftName,
            shiftDate: dayjs(selectedDate).format("YYYY-MM-DD"),
            shiftTime: shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : "Time not set",
            shiftStatus: shift.shiftStatus
        })
        setReplacementModalOpen(true)
    }

    const handleReplacementSuccess = () => {
        // Refresh the staff shifts data
        queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] })
        queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
    }

    // Check if shift is eligible for replacement (only CONFLICTED or REQUEST_CHANGE status)
    const isEligibleForReplacement = (shiftStatus: string) => {
        return shiftStatus === "CONFLICTED" || shiftStatus === "REQUEST_CHANGE"
    }

    const isLoading = isLoadingScheduledShifts || isLoadingStaffShiftsGrouped || isLoadingRoles

    const renderOpenShiftInfo = () => {
        if (openShiftsForDate.length === 0) {
            return (
                <Card className="border-2 border-dashed border-muted">
                    <CardContent className="pt-12 pb-12">
                        <div className="text-center text-muted-foreground">
                            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No open shifts found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                No open shifts available for {dayjs(selectedDate).format("DD/MM/YYYY")}
                            </p>
                            <Button onClick={handleAddClick} className="gap-2 font-medium">
                                <Plus className="w-4 h-4" />
                                Create Open Shift
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                Open Shifts - {dayjs(selectedDate).format("DD/MM/YYYY")}
                            </CardTitle>
                            <Button onClick={handleAddClick} size="sm" className="gap-2 font-medium">
                                <Plus className="w-4 h-4" />
                                Create New
                            </Button>
                        </div>
                        <CardDescription className="text-muted-foreground">
                            {openShiftsForDate.length} open shift{openShiftsForDate.length !== 1 ? 's' : ''} available
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid gap-4">
                    {openShiftsForDate.map((shift: any, index: number) => {
                        const registeredInfo = getRegisteredStaffCount(shift)

                        return (
                            <Card key={shift.id || index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            {shift.shiftName}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {/* <Badge variant={shift.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                {shift.status === 'PUBLISHED' ? 'Published' : 'Open'}
                                            </Badge> */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        disabled={deletingShiftId === shift.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Open Shift</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete the "{shift.name}" open shift for {dayjs(selectedDate).format("DD/MM/YYYY")}?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteOpenShift(shift.id, shift.name)}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 bg-card rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {shift.startTime && shift.endTime
                                                    ? `${shift.startTime} - ${shift.endTime}`
                                                    : "Time not set"
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{shift.branchName}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>Registered: {registeredInfo.total} staff</span>
                                        </div>

                                        {shift.requirements && shift.requirements.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-foreground">Requirements:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {shift.requirements.map((req: any, reqIndex: number) => {
                                                        const registered = registeredInfo.byRole.find(r => r.role === req.role)?.count || 0
                                                        const isComplete = registered >= req.quantity

                                                        return (
                                                            <Badge
                                                                key={reqIndex}
                                                                variant={isComplete ? "default" : "secondary"}
                                                                className={isComplete ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}
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
                <Card className="border-2 border-dashed border-muted">
                    <CardContent className="pt-12 pb-12">
                        <div className="text-center text-muted-foreground">
                            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No shifts found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {selectedStaffName} has no shifts on {dayjs(selectedDate).format("DD/MM/YYYY")}
                            </p>
                            <Button onClick={handleAddClick} className="gap-2 font-medium">
                                <Plus className="w-4 h-4" />
                                Register for Shift
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <User className="h-4 w-4" />
                                </div>
                                {selectedStaffName}'s Shifts - {dayjs(selectedDate).format("DD/MM/YYYY")}
                            </CardTitle>
                            <Button onClick={handleAddClick} size="sm" className="gap-2 font-medium">
                                <Plus className="w-4 h-4" />
                                Register More
                            </Button>
                        </div>
                        <CardDescription className="text-muted-foreground">
                            {employeeShiftsForDate.length} shift{employeeShiftsForDate.length !== 1 ? 's' : ''} scheduled • Role: {getStaffRole}
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid gap-4">
                    {employeeShiftsForDate.map((shift: any, index: number) => (
                        <Card key={shift.id || index} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        {shift.shiftName}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={shift.shiftStatus === 'PUBLISHED' ? 'default' : 'secondary'}>
                                            {shift.shiftStatus}
                                        </Badge>
                                        {isEligibleForReplacement(shift.shiftStatus) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={() => handleOpenReplacementModal(shift)}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {shift.shiftStatus === "DRAFT" && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                                            className="bg-destructive hover:bg-destructive/90"
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
                            <CardContent className="space-y-4 bg-card rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>
                                            {shift.startTime && shift.endTime
                                                ? `${shift.startTime} - ${shift.endTime}`
                                                : "Time not set"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span>Role: {getStaffRole}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{shift.branchName}</span>
                                </div>

                                {shift.note && (
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="text-sm">
                                            <span className="font-medium text-foreground">Note: </span>
                                            <span className="text-muted-foreground">{shift.note}</span>
                                        </div>
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
            return {
                title: "Open Shift Information",
                description: "View and manage open shifts for the selected date",
                icon: Calendar
            }
        } else if (shiftInfoModalType === "employee-shift") {
            return {
                title: "Employee Shift Information",
                description: `View and manage shifts for ${selectedStaffName}`,
                icon: User
            }
        }
        return {
            title: "Shift Information",
            description: "View shift details and information",
            icon: Clock
        }
    }

    const modalInfo = getModalTitle()
    const IconComponent = modalInfo.icon

    return (
        <Dialog open={isShiftInfoModalOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{modalInfo.title}</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                {modalInfo.description}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <span className="text-muted-foreground">Loading shift information...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {shiftInfoModalType === "open-shift" && renderOpenShiftInfo()}
                            {shiftInfoModalType === "employee-shift" && renderEmployeeShiftInfo()}
                        </div>
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

            {/* Staff Replacement Modal */}
            {selectedShiftForReplacement && (
                <StaffReplacementModal
                    isOpen={replacementModalOpen}
                    onClose={() => {
                        setReplacementModalOpen(false)
                        setSelectedShiftForReplacement(null)
                    }}
                    staffShiftId={selectedShiftForReplacement.staffShiftId}
                    currentStaffName={selectedShiftForReplacement.currentStaffName}
                    shiftName={selectedShiftForReplacement.shiftName}
                    shiftDate={selectedShiftForReplacement.shiftDate}
                    shiftTime={selectedShiftForReplacement.shiftTime}
                    shiftStatus={selectedShiftForReplacement.shiftStatus}
                    onReplacementSuccess={handleReplacementSuccess}
                />
            )}
        </Dialog>
    )
}

export default ShiftInfoModal 