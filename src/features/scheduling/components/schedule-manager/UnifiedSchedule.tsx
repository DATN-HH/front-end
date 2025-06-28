"use client"

import { useContext } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"
import { ShiftStatus } from "@/api/v1/publish-shifts"
import AddShiftModal from "./AddShiftModal"
import dayjs from "dayjs"

interface UnifiedScheduleProps {
    viewMode: "weekly" | "monthly"
}

const UnifiedSchedule = ({ viewMode }: UnifiedScheduleProps) => {
    const {
        startDate,
        endDate,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
        roles,
        isLoadingRoles,
        scheduledShifts,
        isLoadingScheduledShifts,
        setIsCreateOpenShiftDialogOpen,
        setSelectedDate,
        setIsShiftInfoModalOpen,
        setShiftInfoModalType,
        setSelectedStaffName
    } = useContext(ScheduleContext)

    // Generate dates based on view mode and context date range
    const generateScheduleData = () => {
        const start = dayjs(startDate)
        const end = dayjs(endDate)
        const data: Record<string, { label: string; hasShifts: boolean }> = {}

        if (viewMode === "weekly") {
            // For weekly view, use the week range from context
            let current = start
            while (current.isBefore(end) || current.isSame(end)) {
                const dateStr = current.format("YYYY-MM-DD")
                data[dateStr] = {
                    label: current.format("ddd D/M"),
                    hasShifts: true
                }
                current = current.add(1, "day")
            }
        } else {
            // For monthly view, show all days in the month
            const monthStart = start.startOf('month')
            const monthEnd = start.endOf('month')
            let current = monthStart

            while (current.isBefore(monthEnd) || current.isSame(monthEnd)) {
                const dateStr = current.format("YYYY-MM-DD")
                data[dateStr] = {
                    label: current.format("D/M"),
                    hasShifts: true
                }
                current = current.add(1, "day")
            }
        }

        return data
    }

    const scheduleData = generateScheduleData()

    // Get open shifts data from scheduledShifts
    const getOpenShiftsData = () => {
        if (!scheduledShifts || isLoadingScheduledShifts) {
            return {}
        }

        const openShiftsData: Record<string, any[]> = {}

        // Filter open shifts (shifts without assigned staff)
        const openShiftsList = scheduledShifts.filter((shift: any) => !shift.staffId || shift.staffId === null)

        openShiftsList.forEach((shift: any) => {
            const dateStr = dayjs(shift.date).format("YYYY-MM-DD")
            if (!openShiftsData[dateStr]) {
                openShiftsData[dateStr] = []
            }
            openShiftsData[dateStr].push({
                id: shift.id,
                name: 'Open Shift',
                time: shift.startTime && shift.endTime ? `${shift.startTime}-${shift.endTime}` : '',
                status: 'DRAFT'
            })
        })

        return openShiftsData
    }

    // Use actual data from context instead of dummy data using new structure
    const getEmployeeScheduleData = () => {
        if (!staffShiftsGrouped || !roles || isLoadingStaffShiftsGrouped || isLoadingRoles) {
            return {}
        }

        const employeeData: Record<string, any> = {}

        // Group employees by role
        Object.keys(staffShiftsGrouped.data).forEach(roleName => {
            const roleData = staffShiftsGrouped.data[roleName]
            const role = roles.find(r => r.name === roleName)

            employeeData[roleName] = {
                role: roleName,
                roleLabel: role?.name || roleName,
                roleColor: getRoleColor(roleName),
                employees: Object.keys(roleData).map((staffName: string) => ({
                    name: staffName,
                    shifts: roleData[staffName].shifts || {}
                }))
            }
        })

        return employeeData
    }

    const getRoleColor = (roleName: string) => {
        if (!roles) return 'bg-gray-100 text-gray-800'

        const role = roles.find(r => r.name === roleName)
        if (!role || !role.hexColor) return 'bg-gray-100 text-gray-800'

        // Use hex color from role data
        return `text-white`
    }

    const getRoleStyle = (roleName: string) => {
        if (!roles) return { backgroundColor: '#6B7280' }

        const role = roles.find(r => r.name === roleName)
        if (!role || !role.hexColor) return { backgroundColor: '#6B7280' }

        return { backgroundColor: role.hexColor }
    }

    // Role configurations
    const roleConfig = {
        manager: {
            label: "Manager",
            color: "bg-purple-100 text-purple-800",
        },
        cashier: {
            label: "Cashier",
            color: "bg-blue-100 text-blue-800",
        },
        chef: {
            label: "Chef",
            color: "bg-red-100 text-red-800",
        },
        waiter: {
            label: "Waiter",
            color: "bg-green-100 text-green-800",
        },
    }

    const statusConfig = {
        [ShiftStatus.DRAFT]: { color: "bg-yellow-500", text: "text-white", label: "Draft" },
        [ShiftStatus.PENDING]: { color: "bg-orange-500", text: "text-white", label: "Pending" },
        [ShiftStatus.PUBLISHED]: { color: "bg-green-500", text: "text-white", label: "Published" },
        [ShiftStatus.CONFLICTED]: { color: "bg-red-500", text: "text-white", label: "Conflicted" },
        [ShiftStatus.REQUEST_CHANGE]: { color: "bg-blue-500", text: "text-white", label: "Change Requested" },
    }

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleCreateOpenShift = (date: string) => {
        setSelectedDate(new Date(date))
        setIsCreateOpenShiftDialogOpen(true)
    }

    const handleOpenShiftClick = (date: string) => {
        setSelectedDate(new Date(date))
        setShiftInfoModalType("open-shift")
        setIsShiftInfoModalOpen(true)
    }

    const handleEmployeeShiftClick = (employeeName: string, date: string) => {
        setSelectedDate(new Date(date))
        setSelectedStaffName(employeeName)
        setShiftInfoModalType("employee-shift")
        setIsShiftInfoModalOpen(true)
    }

    const renderShiftCell = (employeeName: string, date: string, shifts: any[]) => {
        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleEmployeeShiftClick(employeeName, date)}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            )
        }

        // Count shifts by status
        const statusCounts = Object.values(ShiftStatus).reduce((acc, status) => {
            acc[status] = shifts.filter(shift => shift.shiftStatus === status).length
            return acc
        }, {} as Record<string, number>)

        return (
            <div
                className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1"
                onClick={() => handleEmployeeShiftClick(employeeName, date)}
            >
                {Object.entries(statusCounts).map(([status, count]) => {
                    if (count === 0) return null
                    const config = statusConfig[status as ShiftStatus]
                    if (!config) return null

                    return (
                        <div
                            key={status}
                            className={`w-7 h-7 ${config.color} ${config.text} rounded-full flex items-center justify-center text-sm font-medium`}
                            title={`${count} ${config.label} shift${count > 1 ? 's' : ''}`}
                        >
                            {count}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderOpenShiftCell = (date: string) => {
        const openShiftsData = getOpenShiftsData()
        const shifts = openShiftsData[date] || []

        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCreateOpenShift(date)}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            )
        }

        return (
            <div
                className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1"
                onClick={() => handleOpenShiftClick(date)}
            >
                <div className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {shifts.length}
                </div>
            </div>
        )

    }

    // Transform data for rendering
    const employeeScheduleData = getEmployeeScheduleData()
    const employeesByRole = Object.values(employeeScheduleData)

    const dates = Object.keys(scheduleData).sort()

    // Column width based on view mode
    const columnWidth = viewMode === "weekly" ? "min-w-32" : "min-w-0"
    const columnFlexClass = viewMode === "weekly" ? "flex-1" : "flex-1"

    // Show loading state
    if (isLoadingStaffShiftsGrouped || isLoadingRoles || isLoadingScheduledShifts) {
        return (
            <div className="w-full bg-white p-8 text-center">
                <div className="text-gray-500">Loading schedule...</div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white">
            {/* Header */}
            <div className="flex border-b-2 border-gray-300">
                <div className="w-64 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-300">
                </div>

                {dates.map((date) => {
                    const dayInfo = scheduleData[date]
                    return (
                        <div key={date} className={`${columnFlexClass} ${columnWidth} border-r border-gray-300`}>
                            <div className="p-2 text-center bg-blue-50">
                                <div className="font-medium text-xs text-gray-900">{dayInfo.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Open Shifts Row */}
            <div className="flex border-b border-gray-300">
                <div className="w-64 flex-shrink-0 p-3 bg-white border-r border-gray-300 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Open Shifts</span>
                        </div>
                    </div>
                </div>
                {dates.map((date) => (
                    <div key={date} className={`${columnFlexClass} ${columnWidth} border-r border-gray-200`}>
                        {renderOpenShiftCell(date)}
                    </div>
                ))}
            </div>

            {/* Employee rows grouped by role */}
            <div className="divide-y divide-gray-300">
                {employeesByRole.map(({ role, roleLabel, roleColor, employees }) => (
                    <div key={role} className="bg-gray-25">
                        {/* Role header */}
                        <div className="flex bg-gray-100">
                            <div className="w-64 flex-shrink-0 p-3 flex items-center gap-3 border-r border-gray-300">
                                <Badge
                                    className={`${getRoleColor(role)} font-medium`}
                                    style={getRoleStyle(role)}
                                >
                                    {roleLabel}
                                </Badge>
                                <span className="text-sm text-gray-600">({employees.length} staff)</span>
                            </div>
                            {dates.map((date) => (
                                <div key={date} className={`${columnFlexClass} ${columnWidth} border-r border-gray-200 bg-gray-50`}></div>
                            ))}
                        </div>

                        {/* Employees in this role */}
                        <div className="divide-y divide-gray-200">
                            {employees.map((employee: any, empIndex: number) => (
                                <div key={`${role}-${empIndex}`} className="flex">
                                    {/* Employee info */}
                                    <div className="w-64 h-12 flex-shrink-0 p-3 bg-white border-r border-gray-300 flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                                {getInitials(employee.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    </div>

                                    {/* Daily shifts */}
                                    {dates.map((date) => (
                                        <div key={date} className={`${columnFlexClass} ${columnWidth} border-r border-gray-200`}>
                                            {renderShiftCell(employee.name, date, employee.shifts[date] || [])}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Legend */}
            <div className="border-t border-gray-300 bg-gray-50 p-4">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-sm font-medium text-gray-700">Legend:</div>
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-7 h-7 ${config.color} rounded-full flex items-center justify-center`}>
                                <span className="text-sm text-white font-medium">1</span>
                            </div>
                            <span className="text-sm text-gray-600">{config.label} shifts</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white font-medium">1</span>
                        </div>
                        <span className="text-sm text-gray-600">Open shifts</span>
                    </div>
                </div>
            </div>

            {/* Add Shift Modal */}
            <AddShiftModal />
        </div>
    )
}

export default UnifiedSchedule 