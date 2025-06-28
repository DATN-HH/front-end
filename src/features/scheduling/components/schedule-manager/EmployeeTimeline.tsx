import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useContext, useMemo } from "react"
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"
import { ShiftStatus } from "@/api/v1/publish-shifts"
import dayjs from "dayjs"

const EmployeeTimeline = () => {
  const {
    selectedDate,
    staffShiftsGrouped,
    isLoadingStaffShiftsGrouped,
    roles,
    isLoadingRoles
  } = useContext(ScheduleContext)

  const getRoleColor = (roleName: string) => {
    if (!roles) return 'bg-gray-100 text-gray-800'

    const role = roles.find(r => r.name === roleName)
    if (!role || !role.hexColor) return 'bg-gray-100 text-gray-800'

    return `text-white`
  }

  const getRoleStyle = (roleName: string) => {
    if (!roles) return { backgroundColor: '#6B7280' }

    const role = roles.find(r => r.name === roleName)
    if (!role || !role.hexColor) return { backgroundColor: '#6B7280' }

    return { backgroundColor: role.hexColor }
  }

  const getShiftStyle = (roleName: string) => {
    if (!roles) return { backgroundColor: '#E5E7EB', borderColor: '#D1D5DB' }

    const role = roles.find(r => r.name === roleName)
    if (!role || !role.hexColor) return { backgroundColor: '#E5E7EB', borderColor: '#D1D5DB' }

    // Create lighter version for background and use role color for border
    const hex = role.hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
      borderColor: role.hexColor
    }
  }

  // Get shift status styling
  const getShiftStatusStyle = (status: string) => {
    switch (status) {
      case ShiftStatus.DRAFT:
        return {
          className: "opacity-70 border-dashed",
          indicator: { color: "#EAB308", label: "Draft" }
        }
      case ShiftStatus.PENDING:
        return {
          className: "opacity-80",
          indicator: { color: "#F97316", label: "Pending" }
        }
      case ShiftStatus.PUBLISHED:
        return {
          className: "",
          indicator: { color: "#22C55E", label: "Published" }
        }
      case ShiftStatus.CONFLICTED:
        return {
          className: "opacity-90 border-dashed",
          indicator: { color: "#EF4444", label: "Conflicted" }
        }
      case ShiftStatus.REQUEST_CHANGE:
        return {
          className: "opacity-85",
          indicator: { color: "#3467EB", label: "Change Requested" }
        }
      default:
        return {
          className: "",
          indicator: { color: "#6B7280", label: "Unknown" }
        }
    }
  }

  // Get data for selected date using new structure
  const getEmployeeScheduleData = useMemo(() => {
    if (!staffShiftsGrouped || !roles || isLoadingStaffShiftsGrouped || isLoadingRoles) {
      return []
    }

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD")

    return Object.entries(staffShiftsGrouped.data).map(([roleName, roleData]) => {
      const role = roles.find(r => r.name === roleName)

      return {
        role: roleName,
        roleLabel: role?.name || roleName,
        roleColor: getRoleColor(roleName),
        employees: Object.entries(roleData).map(([staffName, staffData]) => ({
          name: staffName,
          shifts: staffData.shifts[dateStr] || [] // Show all employees, even those without shifts on selected date
        }))
      }
    }).filter(roleGroup => roleGroup.employees.length > 0) // Only filter out roles with no employees at all
  }, [staffShiftsGrouped, roles, selectedDate, isLoadingStaffShiftsGrouped, isLoadingRoles])

  // Generate hour labels (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00")

  // Convert time string to hour number with minutes
  const timeToHour = (timeString: string): number => {
    const [hour, minute] = timeString.split(":")
    return Number(hour) + Number(minute) / 60
  }

  // Calculate duration in hours
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = timeToHour(startTime)
    const end = timeToHour(endTime)
    return end > start ? end - start : 24 - start + end
  }

  const getShiftPosition = (startTime: string, endTime: string) => {
    const start = timeToHour(startTime)
    const duration = calculateDuration(startTime, endTime)
    const left = (start / 24) * 100
    const width = (duration / 24) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Show loading state
  if (isLoadingStaffShiftsGrouped || isLoadingRoles) {
    return (
      <div className="w-full bg-white p-8 text-center">
        <div className="text-gray-500">Loading employee timeline...</div>
      </div>
    )
  }

  // Show empty state if no data
  if (getEmployeeScheduleData.length === 0) {
    return (
      <div className="w-full bg-white p-8 text-center">
        <div className="text-gray-500">No employees found</div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white">
      {/* Header with time labels */}
      <div className="flex border-b">
        <div className="w-64 flex-shrink-0 p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Work Schedule - {dayjs(selectedDate).format("DD/MM/YYYY")}</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="flex">
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-gray-500 py-2 border-l border-gray-200"
                style={{ width: `${100 / 24}%` }}
              >
                {hour}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee rows grouped by role */}
      <div className="divide-y divide-gray-300">
        {getEmployeeScheduleData.map(({ role, roleLabel, roleColor, employees }) => (
          <div key={role} className="bg-gray-25">
            {/* Role header */}
            <div className="flex bg-gray-100">
              <div className="w-64 flex-shrink-0 p-3 flex items-center gap-3">
                <Badge
                  className={`${getRoleColor(role)} font-medium`}
                  style={getRoleStyle(role)}
                >
                  {roleLabel}
                </Badge>
                <span className="text-sm text-gray-600">({employees.length} staff)</span>
              </div>
              <div className="flex-1 bg-gray-50"></div>
            </div>

            {/* Employees in this role */}
            <div className="divide-y divide-gray-200">
              {employees.map((employee, empIndex) => (
                <div key={`${role}-${empIndex}`} className="flex min-h-16">
                  {/* Employee info */}
                  <div className="w-64 flex-shrink-0 p-3 bg-white flex items-center gap-3">
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

                  {/* Timeline */}
                  <div className="flex-1 relative bg-white">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-l border-gray-100"
                          style={{ width: `${100 / 24}%` }}
                        ></div>
                      ))}
                    </div>

                    {/* Shifts */}
                    <div className="relative h-full py-2">
                      {employee.shifts.map((shift, shiftIndex) => {
                        const position = getShiftPosition(shift.startTime.toString(), shift.endTime.toString())
                        const statusStyle = getShiftStatusStyle(shift.shiftStatus)

                        return (
                          <div
                            key={shiftIndex}
                            className={`absolute h-8 rounded-md border-2 flex items-center justify-center top-2 ${statusStyle.className}`}
                            style={{
                              left: position.left,
                              width: position.width,
                              minWidth: '80px',
                              ...getShiftStyle(role)
                            }}
                            title={`${shift.shiftName} - ${shift.startTime} - ${shift.endTime} (${statusStyle.indicator.label})`}
                          >
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/90 border-0 font-medium px-1.5 py-0.5"
                              >
                                {shift.startTime.toString().slice(0, 5)} - {shift.endTime.toString().slice(0, 5)}
                              </Badge>
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: statusStyle.indicator.color }}
                                title={statusStyle.indicator.label}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Status Legend */}
      <div className="border-t border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-sm font-medium text-gray-700">Status Legend:</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Conflicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Change Requested</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeTimeline

