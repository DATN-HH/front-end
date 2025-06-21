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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LocalTime, useCreateScheduledShift } from "@/api/v1"
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"
import { useContext, useMemo, useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, CheckCircle, Clock, Users, Plus, Calendar } from "lucide-react"
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Create Open Shift</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Create an open shift for {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {availableShifts.length === 0 ? (
                        <Card className="border-2 border-dashed border-muted">
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center text-muted-foreground">
                                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">No shifts available</h3>
                                    <p className="text-sm text-muted-foreground">
                                        No shifts are configured for {format(selectedDate, 'EEEE')}s
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        Available Shifts
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        {availableShifts.length} shift{availableShifts.length !== 1 ? 's' : ''} available for {format(selectedDate, 'EEEE')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <div className="grid gap-4">
                                {availableShifts.map((shift) => {
                                    const isScheduled = isShiftScheduled(shift.id)
                                    const isOpen = openCollapse === shift.id

                                    return (
                                        <Card key={shift.id} className={`border-2 transition-colors ${isScheduled
                                            ? 'border-muted bg-muted/30 opacity-60'
                                            : 'border-secondary/50 bg-secondary/10 hover:border-secondary'
                                            }`}>
                                            <Collapsible
                                                open={isOpen}
                                                onOpenChange={(open) => setOpenCollapse(open ? shift.id : null)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isScheduled
                                                                    ? 'bg-muted-foreground text-background'
                                                                    : 'bg-secondary text-secondary-foreground'
                                                                    }`}>
                                                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">{shift.name}</span>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                                                                    </div>
                                                                </div>
                                                            </CardTitle>

                                                            <div className="flex items-center gap-2">
                                                                {isScheduled && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Already Scheduled
                                                                    </Badge>
                                                                )}
                                                                {!isScheduled && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleCreateShift(shift.id)
                                                                        }}
                                                                        disabled={createScheduledShift.isPending}
                                                                        className="font-medium"
                                                                    >
                                                                        {createScheduledShift.isPending ? "Creating..." : "Create Shift"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 bg-card rounded-lg border-t">
                                                        <div className="space-y-3 pt-4">
                                                            <div>
                                                                <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                                                                    <Users className="h-4 w-4" />
                                                                    Staff Requirements
                                                                </Label>
                                                                <div className="mt-2">
                                                                    {shift.requirements && shift.requirements.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {shift.requirements.map((req, index) => (
                                                                                <Badge key={index} variant="outline" className="font-medium">
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
                                                                <Label className="text-sm font-medium text-foreground">Working Days</Label>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {shift.weekDays.map((day) => (
                                                                        <Badge
                                                                            key={day}
                                                                            variant={day === currentWeekDay ? "default" : "secondary"}
                                                                            className="text-xs font-medium"
                                                                        >
                                                                            {day}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpenShiftDialogOpen(false)}
                        className="px-8 h-11"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateOpenShift 