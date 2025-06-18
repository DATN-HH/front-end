import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LocalTime, useCreateScheduledShift } from "@/api/v1"
import { ScheduleContext } from "../../contexts/context-schedule"
import { useContext, useMemo, useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, CheckCircle, Clock, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface CreateOpenShiftProps {
    selectedDate: Date
}

const CreateOpenShift = ({ selectedDate }: CreateOpenShiftProps) => {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const {
        isCreateOpenShiftDialogOpen,
        setIsCreateOpenShiftDialogOpen,
        shifts,
        scheduledShifts
    } = useContext(ScheduleContext)

    const [openCollapse, setOpenCollapse] = useState<number | null>(null)
    const createScheduledShift = useCreateScheduledShift()

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay()
    const weekDayMap = {
        0: 'SUN',
        1: 'MON',
        2: 'TUE',
        3: 'WED',
        4: 'THU',
        5: 'FRI',
        6: 'SAT'
    }
    const currentWeekDay = weekDayMap[dayOfWeek as keyof typeof weekDayMap]

    // Get scheduled shifts for selected date
    const scheduledShiftsForDate = useMemo(() => {
        const dateString = format(selectedDate, 'yyyy-MM-dd')
        return scheduledShifts?.filter(shift => shift.date === dateString) || []
    }, [scheduledShifts, selectedDate])

    // Filter shifts available for the selected day
    const availableShifts = useMemo(() => {
        return (shifts || []).filter(shift =>
            shift.weekDays.includes(currentWeekDay as any) &&
            shift.status === 'ACTIVE'
        )
    }, [shifts, currentWeekDay])

    // Check if shift is already scheduled
    const isShiftScheduled = (shiftId: number) => {
        return scheduledShiftsForDate.some(scheduledShift => scheduledShift.shiftId === shiftId)
    }

    const handleCreateShift = async (shiftId: number) => {
        if (!user?.branch?.id) {
            toast.error("Branch information is missing")
            return
        }

        try {
            await createScheduledShift.mutateAsync({
                shiftId,
                branchId: user.branch.id,
                date: format(selectedDate, 'yyyy-MM-dd')
            })

            toast.success("Open shift created successfully")
            setIsCreateOpenShiftDialogOpen(false)

            // Refresh the scheduled shifts data
            queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
        } catch (error) {
            toast.error("Failed to create open shift")
            console.error(error)
        }
    }

    const formatTime = (time: LocalTime) => {
        return `${time}`;
    }

    return (
        <Dialog open={isCreateOpenShiftDialogOpen} onOpenChange={setIsCreateOpenShiftDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh]">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-slate-700">
                        Create Open Shift - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4 max-h-[calc(80vh-120px)] overflow-y-auto ">
                    {availableShifts.length === 0 ? (
                        <Card>
                            <CardContent className="pt-0">
                                <div className="text-center text-muted-foreground">
                                        <Clock className="mx-auto h-12 w-12 mb-0" />
                                        <p>No shifts are available for {format(selectedDate, 'EEEE')}s</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {availableShifts.map((shift) => {
                                const isScheduled = isShiftScheduled(shift.id)
                                const isOpen = openCollapse === shift.id

                                return (
                                    <Card key={shift.id} className={`${isScheduled ? 'opacity-60' : ''}`}>
                                        <Collapsible
                                            open={isOpen}
                                            onOpenChange={(open) => setOpenCollapse(open ? shift.id : null)}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                            <span className="font-medium w-10">{shift.name}</span>
                                                        </div>

                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                                                        </div>

                                                        {isScheduled && (
                                                            <Badge variant="secondary" className="flex items-center space-x-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                <span>Already Scheduled</span>
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {!isScheduled && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleCreateShift(shift.id)
                                                            }}
                                                            disabled={createScheduledShift.isPending}
                                                        >
                                                            {createScheduledShift.isPending ? "Creating..." : "Create"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="px-4 pb-4 border-t bg-muted/20">
                                                    <div className="pt-3 space-y-3">
                                                        <div>
                                                            <Label className="text-sm font-medium flex items-center space-x-2">
                                                                <Users className="h-4 w-4" />
                                                                <span>Staff Requirements</span>
                                                            </Label>
                                                            <div className="mt-2">
                                                                {shift.requirements && shift.requirements.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {shift.requirements.map((req, index) => (
                                                                            <Badge key={index} variant="outline">
                                                                                {req.quantity} {req.role}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-muted-foreground">No specific requirements</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium">Working Days</Label>
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {shift.weekDays.map((day) => (
                                                                    <Badge
                                                                        key={day}
                                                                        variant={day === currentWeekDay ? "default" : "secondary"}
                                                                        className="text-xs"
                                                                    >
                                                                        {day}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-white border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpenShiftDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateOpenShift 