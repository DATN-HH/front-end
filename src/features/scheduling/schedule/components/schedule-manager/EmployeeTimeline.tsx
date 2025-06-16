import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const EmployeeTimeline = () => {
  // Sample data based on the provided structure
  const scheduleData = {
    manager: {
      "NGUYEN HUNG": {
        "2025-12-20": [
          {
            id: 1,
            note: "Full day management",
            shiftStatus: "CONFIRMED",
            date: "2025-12-20",
            shiftId: 1,
            startTime: "08:00:00",
            endTime: "18:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 1,
            staffName: "NGUYEN HUNG",
            roleName: "manager",
          },
        ],
      },
    },
    cashier: {
      "Anh A": {
        "2025-12-20": [
          {
            id: 2,
            note: "Morning shift",
            shiftStatus: "DRAFT",
            date: "2025-12-20",
            shiftId: 2,
            startTime: "08:00:00",
            endTime: "16:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 2,
            staffName: "Anh A",
            roleName: "cashier",
          },
        ],
      },
      "Nguyễn Văn B": {
        "2025-12-20": [
          {
            id: 3,
            note: "Evening shift",
            shiftStatus: "CONFIRMED",
            date: "2025-12-20",
            shiftId: 3,
            startTime: "14:00:00",
            endTime: "22:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 3,
            staffName: "Nguyễn Văn B",
            roleName: "cashier",
          },
        ],
      },
    },
    chef: {
      "Chef Minh": {
        "2025-12-20": [
          {
            id: 4,
            note: "Kitchen prep",
            shiftStatus: "CONFIRMED",
            date: "2025-12-20",
            shiftId: 4,
            startTime: "06:00:00",
            endTime: "14:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 4,
            staffName: "Chef Minh",
            roleName: "chef",
          },
        ],
      },
      "Chef Nam": {
        "2025-12-20": [
          {
            id: 5,
            note: "Dinner service",
            shiftStatus: "DRAFT",
            date: "2025-12-20",
            shiftId: 5,
            startTime: "16:00:00",
            endTime: "23:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 5,
            staffName: "Chef Nam",
            roleName: "chef",
          },
        ],
      },
    },
    waiter: {
      "Trần Thị C": {
        "2025-12-20": [
          {
            id: 6,
            note: "Morning service",
            shiftStatus: "CONFIRMED",
            date: "2025-12-20",
            shiftId: 6,
            startTime: "07:00:00",
            endTime: "15:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 6,
            staffName: "Trần Thị C",
            roleName: "waiter",
          },
        ],
      },
      "Lê Văn D": {
        "2025-12-20": [
          {
            id: 7,
            note: "Split shift",
            shiftStatus: "CONFIRMED",
            date: "2025-12-20",
            shiftId: 7,
            startTime: "11:00:00",
            endTime: "14:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 7,
            staffName: "Lê Văn D",
            roleName: "waiter",
          },
          {
            id: 8,
            note: "Evening service",
            shiftStatus: "DRAFT",
            date: "2025-12-20",
            shiftId: 8,
            startTime: "18:00:00",
            endTime: "22:00:00",
            branchId: 1,
            branchName: "Branch 1",
            staffId: 8,
            staffName: "Lê Văn D",
            roleName: "waiter",
          },
        ],
      },
    },
  }

  // Role configurations
  const roleConfig = {
    manager: {
      label: "Manager",
      color: "bg-purple-100 text-purple-800",
      shiftColor: "bg-purple-200 border-purple-300",
    },
    cashier: {
      label: "Cashier",
      color: "bg-blue-100 text-blue-800",
      shiftColor: "bg-blue-200 border-blue-300",
    },
    chef: {
      label: "Chef",
      color: "bg-red-100 text-red-800",
      shiftColor: "bg-red-200 border-red-300",
    },
    waiter: {
      label: "Waiter",
      color: "bg-green-100 text-green-800",
      shiftColor: "bg-green-200 border-green-300",
    },
  }

  // Status colors
  const statusConfig = {
    DRAFT: "bg-yellow-100 border-yellow-300",
    CONFIRMED: "bg-green-100 border-green-300",
    CANCELLED: "bg-red-100 border-red-300",
  }

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

  // Transform data for rendering
  const employeesByRole = Object.entries(scheduleData).map(([role, employees]) => ({
    role,
    roleLabel: roleConfig[role as keyof typeof roleConfig]?.label || role,
    roleColor: roleConfig[role as keyof typeof roleConfig]?.color || "bg-gray-100 text-gray-800",
    employees: Object.entries(employees).map(([name, schedules]) => ({
      name,
      shifts: Object.values(schedules)[0] || [], // Taking first date's shifts
    })),
  }))

  return (
    <div className="w-full bg-white">
      {/* Header with time labels */}
      <div className="flex border-b">
        <div className="w-64 flex-shrink-0 p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Work Schedule</span>
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
        {employeesByRole.map(({ role, roleLabel, roleColor, employees }) => (
          <div key={role} className="bg-gray-25">
            {/* Role header */}
            <div className="flex bg-gray-100">
              <div className="w-64 flex-shrink-0 p-3 flex items-center gap-3">
                <Badge className={`${roleColor} font-medium`}>{roleLabel}</Badge>
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
                        const position = getShiftPosition(shift.startTime, shift.endTime)
                        const shiftColor = roleConfig[role as keyof typeof roleConfig]?.shiftColor || "bg-gray-200 border-gray-300"
                        const statusColor = statusConfig[shift.shiftStatus as keyof typeof statusConfig] || "bg-gray-100 border-gray-300"

                        return (
                          <div
                            key={shiftIndex}
                            className={`absolute h-8 rounded-md border-2 ${shiftColor} flex items-center justify-center top-2 ${shift.shiftStatus === "DRAFT" ? "opacity-70 border-dashed" : ""
                              }`}
                            style={{
                              left: position.left,
                              width: position.width,
                              minWidth: '60px'
                            }}
                            title={`${shift.startTime} - ${shift.endTime} (${shift.shiftStatus})`}
                          >
                            <div className="flex items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/90 border-0 font-medium px-1.5 py-0.5"
                              >
                                {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                              </Badge>
                              {shift.shiftStatus === "DRAFT" && (
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                              )}
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
    </div>
  )
}
export default EmployeeTimeline

