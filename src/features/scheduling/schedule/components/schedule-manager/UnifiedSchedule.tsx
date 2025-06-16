"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import ShiftDetailsModal from "./ShiftDetailsModal"
import AddShiftModal from "./AddShiftModal"
import ShiftInfoModal from "./ShiftInfoModal"
import CreateOpenShift from "./CreateOpenShift"

interface UnifiedScheduleProps {
    viewMode: "weekly" | "monthly"
}

const UnifiedSchedule = ({ viewMode }: UnifiedScheduleProps) => {
    const [selectedShifts, setSelectedShifts] = useState<any>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [addShiftModalOpen, setAddShiftModalOpen] = useState(false)
    const [shiftInfoModalOpen, setShiftInfoModalOpen] = useState(false)
    const [selectedShift, setSelectedShift] = useState<any>(null)
    const [createOpenShiftModalOpen, setCreateOpenShiftModalOpen] = useState(false)
    const [openShifts, setOpenShifts] = useState<Record<string, any[]>>({})

    // Generate data based on view mode
    const generateScheduleData = () => {
        if (viewMode === "weekly") {
            return {
                "2025-06-09": { label: "Mon 9/6", hasShifts: true },
                "2025-06-10": { label: "Tue 10/6", hasShifts: true },
                "2025-06-11": { label: "Wed 11/6", hasShifts: true },
                "2025-06-12": { label: "Thu 12/6", hasShifts: true },
                "2025-06-13": { label: "Fri 13/6", hasShifts: true },
                "2025-06-14": { label: "Sat 14/6", hasShifts: true },
                "2025-06-15": { label: "Sun 15/6", hasShifts: true }
            }
        } else {
            // Monthly data
            const monthData: Record<string, { label: string; hasShifts: boolean }> = {}
            const daysInMonth = 30 // June has 30 days

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `2025-06-${day.toString().padStart(2, "0")}`
                monthData[dateStr] = {
                    label: `${day}/6`,
                    hasShifts: true,
                }
            }
            return monthData
        }
    }

    const scheduleData = generateScheduleData()

    // Employee data grouped by roles
    const employeeScheduleData = {
        manager: {
            "NGUYEN HUNG": {
                shifts: generateEmployeeShifts("NGUYEN HUNG"),
            },
        },
        cashier: {
            CUSTOMER: {
                shifts: generateEmployeeShifts("CUSTOMER"),
            },
            "Nguyễn Thuỳ Vi": {
                shifts: generateEmployeeShifts("Nguyễn Thuỳ Vi"),
            },
        },
        waiter: {
            "Trần Bá Đức": {
                shifts: generateEmployeeShifts("Trần Bá Đức"),
            },
            "Nguyễn Nhật Ký": {
                shifts: generateEmployeeShifts("Nguyễn Nhật Ký"),
            },
        },
        chef: {
            "Trần Bá Đức": {
                shifts: generateEmployeeShifts("Trần Bá Đức"),
            },
            "Nguyễn Thuỳ Vi": {
                shifts: generateEmployeeShifts("Nguyễn Thuỳ Vi"),
            },
            "TOEIC LR": {
                shifts: generateEmployeeShifts("TOEIC LR"),
            },
        },
    }

    // Generate shifts for an employee
    function generateEmployeeShifts(employeeName: string) {
        const shifts: Record<string, any[]> = {}
        const shiftTypes = ["Shift 1", "Shift 2", "Shift 3", "Shift 6", "Double Shift"]
        const statuses = ["CONFIRMED", "DRAFT"]
        const times = ["06:00-14:00", "08:00-16:00", "08:00-17:30", "14:00-22:00", "17:30-22:00"]

        Object.keys(scheduleData).forEach((date, index) => {
            // Most days have shifts (80% chance)
            const hasShift = Math.random() > 0.2

            if (hasShift) {
                const numShifts = Math.random() > 0.85 ? 2 : 1 // 15% chance of double shift
                const dayShifts = []

                for (let i = 0; i < numShifts; i++) {
                    const shiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)]
                    const status = statuses[Math.floor(Math.random() * statuses.length)]
                    const time = times[Math.floor(Math.random() * times.length)]

                    dayShifts.push({
                        id: index * 100 + i,
                        name: shiftType,
                        time: time,
                        status: status,
                    })
                }

                shifts[date] = dayShifts
            }
        })

        return shifts
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
        DRAFT: { color: "bg-yellow-500", text: "text-white", label: "Draft" },
        CONFIRMED: { color: "bg-green-500", text: "text-white", label: "Confirmed" },
    }

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleShiftClick = (employeeName: string, date: string, shifts: any[]) => {
        setSelectedShifts({
            employeeName,
            date: scheduleData[date].label,
            shifts,
        })
        setModalOpen(true)
    }

    const handleAddShift = () => {
        setModalOpen(false)
        setAddShiftModalOpen(true)
    }

    const handleShiftDetails = (shift: any) => {
        setSelectedShift(shift)
        setShiftInfoModalOpen(true)
    }

    const handleDeleteShift = (shiftId: number) => {
        // Handle shift deletion logic here
        setModalOpen(false)
    }

    const handleOpenShiftClick = (date: string, shifts: any[]) => {
        setSelectedShifts({
            employeeName: "Open Shifts",
            date: scheduleData[date].label,
            shifts,
        })
        setModalOpen(true)
    }

    const handleCreateOpenShift = () => {
        setModalOpen(false)
        setCreateOpenShiftModalOpen(true)
    }

    const handleAddOpenShift = (shiftData: any) => {
        const date = Object.keys(scheduleData).find(
            (d) => scheduleData[d].label === selectedShifts?.date
        )
        if (date) {
            setOpenShifts((prev) => ({
                ...prev,
                [date]: [...(prev[date] || []), { ...shiftData, id: Date.now() }],
            }))
        }
        setCreateOpenShiftModalOpen(false)
    }

    const renderShiftCell = (employeeName: string, date: string, shifts: any[]) => {
        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleAddShift()}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            )
        }

        // Count shifts by status
        const draftCount = shifts.filter(shift => shift.status === "DRAFT").length
        const confirmedCount = shifts.filter(shift => shift.status === "CONFIRMED").length

        return (
            <div
                className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1"
                onClick={() => handleShiftClick(employeeName, date, shifts)}
            >
                {confirmedCount > 0 && (
                    <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {confirmedCount}
                    </div>
                )}
                {draftCount > 0 && (
                    <div className="w-7 h-7 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {draftCount}
                    </div>
                )}
            </div>
        )
    }

    const renderOpenShiftCell = (date: string) => {
        const shifts = openShifts[date] || []

        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCreateOpenShift()}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            )
        }

        // Count shifts by status
        const draftCount = shifts.filter(shift => shift.status === "DRAFT").length
        const confirmedCount = shifts.filter(shift => shift.status === "CONFIRMED").length

        return (
            <div
                className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1"
                onClick={() => handleOpenShiftClick(date, shifts)}
            >
                {confirmedCount > 0 && (
                    <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {confirmedCount}
                    </div>
                )}
                {draftCount > 0 && (
                    <div className="w-7 h-7 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {draftCount}
                    </div>
                )}
            </div>
        )
    }

    // Transform data for rendering
    const employeesByRole = Object.entries(employeeScheduleData).map(([role, employees]) => ({
        role,
        roleLabel: roleConfig[role as keyof typeof roleConfig]?.label || role,
        roleColor: roleConfig[role as keyof typeof roleConfig]?.color || "bg-gray-100 text-gray-800",
        employees: Object.entries(employees).map(([name, data]) => ({
            name,
            shifts: data.shifts,
        })),
    }))

    const dates = Object.keys(scheduleData).sort()

    // Column width based on view mode
    const columnWidth = viewMode === "weekly" ? "min-w-32" : "min-w-0"
    const columnFlexClass = viewMode === "weekly" ? "flex-1" : "flex-1"

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
                                <div className="text-xs text-gray-600 mt-0.5" style={{ fontSize: "10px" }}>
                                    0 Staff
                                </div>
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
                                <Badge className={`${roleColor} font-medium`}>
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
                            {employees.map((employee, empIndex) => (
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
                <div className="flex items-center gap-6">
                    <div className="text-sm font-medium text-gray-700">Legend:</div>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white font-medium">1</span>
                        </div>
                        <span className="text-sm text-gray-600">Confirmed shifts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white font-medium">1</span>
                        </div>
                        <span className="text-sm text-gray-600">Draft shifts</span>
                    </div>
                </div>
            </div>

            {/* Modal for multiple shifts */}
            <ShiftDetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                shifts={selectedShifts?.shifts || []}
                employeeName={selectedShifts?.employeeName || ""}
                date={selectedShifts?.date || ""}
                onDelete={handleDeleteShift}
                onAddShift={selectedShifts?.employeeName === "Open Shifts" ? handleCreateOpenShift : handleAddShift}
                onShiftClick={handleShiftDetails}
            />

            {/* Add Shift Modal */}
            <AddShiftModal
                isOpen={addShiftModalOpen}
                onClose={() => setAddShiftModalOpen(false)}
                onAdd={(shiftData) => {
                    // Handle adding new shift
                    setAddShiftModalOpen(false)
                }}
            />

            {/* Shift Info Modal */}
            <ShiftInfoModal
                isOpen={shiftInfoModalOpen}
                onClose={() => setShiftInfoModalOpen(false)}
                shift={selectedShift}
            />

            <CreateOpenShift
                isOpen={createOpenShiftModalOpen}
                onClose={() => setCreateOpenShiftModalOpen(false)}
                onAdd={handleAddOpenShift}
            />
        </div>
    )
}

export default UnifiedSchedule 