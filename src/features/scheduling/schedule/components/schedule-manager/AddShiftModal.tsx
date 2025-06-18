import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScheduleContext } from "../../contexts/context-schedule"
import { useContext, useMemo } from "react"
import { Clock, Users, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { useCreateStaffShift } from "@/api/v1/staff-shifts"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import {useCustomToast} from '@/lib/show-toast'

const AddShiftModal = () => {
    const { success: successToast, error: errorToast, info: infoToast } = useCustomToast()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const {
        isAddShiftModalOpen,
        setIsAddShiftModalOpen,
        selectedDate,
        selectedStaffName,
        scheduledShifts,
        isLoadingScheduledShifts,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
        roles,
        isLoadingRoles
    } = useContext(ScheduleContext)

    const createStaffShiftMutation = useCreateStaffShift()

    // Get staff role
    const staffRole = useMemo(() => {
        if (!staffShiftsGrouped || !selectedStaffName || isLoadingStaffShiftsGrouped) return null

        for (const roleName of Object.keys(staffShiftsGrouped.data)) {
            const roleData = (staffShiftsGrouped.data as any)[roleName]
            if (roleData[selectedStaffName]) {
                return roleName
            }
        }
        return null
    }, [staffShiftsGrouped, selectedStaffName, isLoadingStaffShiftsGrouped])

    // Get staff ID from staffShiftsGrouped using new structure
    const staffId = useMemo(() => {
        if (!staffShiftsGrouped || !selectedStaffName || isLoadingStaffShiftsGrouped) return null

        for (const roleName of Object.keys(staffShiftsGrouped.data)) {
            const roleData = staffShiftsGrouped.data[roleName]
            if (roleData[selectedStaffName]) {
                // Get staffId directly from StaffShiftData
                return roleData[selectedStaffName].staffId
            }
        }
        return null
    }, [staffShiftsGrouped, selectedStaffName, isLoadingStaffShiftsGrouped])

    // Get open shifts for selected date that match staff role
    const availableOpenShifts = useMemo(() => {
        if (!scheduledShifts || !staffRole || isLoadingScheduledShifts) return []

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")



        return scheduledShifts.filter((shift: any) => {
            // Must be on selected date and be an open shift
            const isOnDate = shift.date === dateStr
            const isOpenShift = !shift.staffId || shift.staffId === null

            // Check if shift has requirement for staff role (try both field names)
            const hasRoleRequirement = shift.requirements?.some((req: any) =>
                req.roleName === staffRole || req.role === staffRole
            )



            return isOnDate && isOpenShift && hasRoleRequirement
        })
    }, [scheduledShifts, selectedDate, staffRole, isLoadingScheduledShifts])

    // Get existing shifts for staff on selected date using new structure
    const existingStaffShifts = useMemo(() => {
        if (!staffShiftsGrouped || !selectedStaffName || isLoadingStaffShiftsGrouped) return []

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")
        const shifts: any[] = []

        Object.keys(staffShiftsGrouped.data).forEach(roleName => {
            const roleData = staffShiftsGrouped.data[roleName]
            if (roleData[selectedStaffName] && roleData[selectedStaffName].shifts[dateStr]) {
                shifts.push(...roleData[selectedStaffName].shifts[dateStr])
            }
        })

        return shifts
    }, [staffShiftsGrouped, selectedStaffName, selectedDate, isLoadingStaffShiftsGrouped])

    // Check time conflict
    const checkTimeConflict = (newShift: any) => {
        if (!newShift.startTime || !newShift.endTime) return false

        const newStart = dayjs(`2000-01-01 ${newShift.startTime}`)
        const newEnd = dayjs(`2000-01-01 ${newShift.endTime}`)

        return existingStaffShifts.some((existingShift: any) => {
            if (!existingShift.startTime || !existingShift.endTime) return false

            const existingStart = dayjs(`2000-01-01 ${existingShift.startTime}`)
            const existingEnd = dayjs(`2000-01-01 ${existingShift.endTime}`)

            // Check if times overlap
            return (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart))
        })
    }

    // Get registered count and remaining spots for a shift
    const getShiftInfo = (shift: any) => {
        if (!staffShiftsGrouped || !shift.requirements) return { registered: 0, total: 0, remaining: 0 }

        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")
        const roleRequirement = shift.requirements.find((req: any) => req.roleName === staffRole || req.role === staffRole)

        if (!roleRequirement) return { registered: 0, total: 0, remaining: 0 }

        let registered = 0
        const roleData = staffRole ? staffShiftsGrouped.data[staffRole] : null

        if (roleData) {
            Object.keys(roleData).forEach(staffName => {
                const staffShifts = roleData[staffName].shifts[dateStr] || []
                const hasShift = staffShifts.some((s: any) =>
                    s.startTime === shift.startTime && s.endTime === shift.endTime
                )
                if (hasShift) registered++
            })
        }

        const total = roleRequirement.quantity
        const remaining = Math.max(0, total - registered)

        return { registered, total, remaining }
    }

    const handleClose = () => {
        setIsAddShiftModalOpen(false)
    }

    const handleRegisterShift = async (shift: any) => {
        if (!staffId) {
            errorToast("Staff ID not found. Please ensure the employee has existing shifts to determine their ID.", "Staff ID not found. Please ensure the employee has existing shifts to determine their ID.")
            return
        }

        if (!shift?.id) {
            errorToast("Invalid shift selected", "Invalid shift selected")
            return
        }

        try {
            console.log('Registering staff shift:', {
                staffId,
                scheduledShiftId: shift.id,
                shiftName: shift.shiftName,
                selectedStaffName
            })

            const result = await createStaffShiftMutation.mutateAsync({
                staffId: staffId,
                scheduledShiftId: shift.id,
                shiftStatus: 'DRAFT',
                // note: `Registered via AddShiftModal for ${selectedStaffName}`
            })

            console.log('Staff shift created successfully:', result)

            // Invalidate and refetch queries to update the UI
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] }),
                queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
                queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
            ])

            successToast(`Successfully registered ${selectedStaffName} for ${shift.shiftName}`, `Successfully registered ${selectedStaffName} for ${shift.shiftName}`)
            handleClose()
        } catch (error: any) {
            console.error('Error registering for shift:', error)
            errorToast("Failed to register for shift", error?.response?.data?.message ||
                error?.message ||
                "Failed to register for shift")
        }
    }

    const isLoading = isLoadingScheduledShifts || isLoadingStaffShiftsGrouped || isLoadingRoles

    if (isLoading) {
        return (
            <Dialog open={isAddShiftModalOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Register for Shift</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isAddShiftModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Register for Shift - {selectedStaffName}
                    </DialogTitle>
                    <div className="text-sm text-gray-600">
                        {dayjs(selectedDate).format("dddd, DD/MM/YYYY")} • Role: {staffRole}
                    </div>
                </DialogHeader>

                <div className="py-4 space-y-4">


                    {availableOpenShifts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No open shifts available for role {staffRole} on the selected date
                            <br />
                            <div className="text-xs mt-2">
                                Try: All open shifts for date: {scheduledShifts?.filter((s: any) =>
                                    s.date === dayjs(selectedDate).format("YYYY-MM-DD") &&
                                    (!s.staffId || s.staffId === null)
                                ).length || 0}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                {availableOpenShifts.length} open shifts available for your role:
                            </div>

                            {availableOpenShifts.map((shift: any, index: number) => {
                                const hasConflict = checkTimeConflict(shift)
                                const shiftInfo = getShiftInfo(shift)
                                const canRegister = shiftInfo.remaining > 0 && !hasConflict
                                const isRegistering = createStaffShiftMutation.isPending

                                return (
                                    <Card key={shift.id || index} className={`border ${hasConflict ? 'border-red-200 bg-red-50' : canRegister ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold text-lg">{shift.shiftName}</div>
                                                <div className="flex gap-2">
                                                    {hasConflict && (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Time Conflict
                                                        </Badge>
                                                    )}
                                                    {canRegister && (
                                                        <Badge variant="default" className="gap-1 bg-green-500">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Available
                                                        </Badge>
                                                    )}
                                                    {!canRegister && !hasConflict && (
                                                        <Badge variant="secondary">
                                                            Full
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
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

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    <span>
                                                        Positions remaining: {shiftInfo.remaining}/{shiftInfo.total}
                                                        ({shiftInfo.registered} registered)
                                                    </span>
                                                </div>
                                            </div>

                                            {hasConflict && (
                                                <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                                    Time conflict with another shift on the same day
                                                </div>
                                            )}

                                            <div className="flex justify-end pt-2">
                                                <Button
                                                    onClick={() => handleRegisterShift(shift)}
                                                    disabled={!canRegister || isRegistering}
                                                    size="sm"
                                                >
                                                    {isRegistering ? "Registering..." :
                                                        hasConflict ? "Cannot Register" :
                                                            canRegister ? "Register for Shift" : "Position Full"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {existingStaffShifts.length > 0 && (
                        <div className="border-t pt-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                                Already registered shifts today:
                            </div>
                            <div className="space-y-2">
                                {existingStaffShifts.map((shift: any, index: number) => (
                                    <div key={index} className="text-sm bg-blue-50 p-2 rounded flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span>{shift.shiftName}: {shift.startTime} - {shift.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddShiftModal 