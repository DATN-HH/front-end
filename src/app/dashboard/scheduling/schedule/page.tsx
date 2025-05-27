"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CalendarIcon, 
  Users, 
  Clock, 
  Download, 
  Printer, 
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data for schedule
const mockScheduleData: Record<string, Record<string, Array<{id: number, name: string, role: string, time: string}>>> = {
  "2024-01-15": {
    "Morning Shift": [
      { id: 1, name: "John Doe", role: "Manager", time: "06:00 - 14:00" },
      { id: 2, name: "Jane Smith", role: "Server", time: "07:00 - 15:00" },
      { id: 3, name: "Mike Johnson", role: "Chef", time: "06:30 - 14:30" },
    ],
    "Evening Shift": [
      { id: 4, name: "Sarah Wilson", role: "Server", time: "14:00 - 22:00" },
      { id: 5, name: "Tom Brown", role: "Chef", time: "14:30 - 22:30" },
    ]
  },
  "2024-01-16": {
    "Morning Shift": [
      { id: 1, name: "John Doe", role: "Manager", time: "06:00 - 14:00" },
      { id: 6, name: "Lisa Davis", role: "Server", time: "07:00 - 15:00" },
      { id: 3, name: "Mike Johnson", role: "Chef", time: "06:30 - 14:30" },
    ],
    "Evening Shift": [
      { id: 2, name: "Jane Smith", role: "Server", time: "14:00 - 22:00" },
      { id: 7, name: "David Lee", role: "Chef", time: "14:30 - 22:30" },
    ]
  },
  // Add more days as needed
}

const shifts = [
  { id: "morning", name: "Morning Shift", time: "06:00 - 14:00", color: "bg-blue-100 text-blue-800" },
  { id: "evening", name: "Evening Shift", time: "14:00 - 22:00", color: "bg-purple-100 text-purple-800" },
  { id: "night", name: "Night Shift", time: "22:00 - 06:00", color: "bg-gray-100 text-gray-800" },
]

export default function ScheduleOverviewPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"week" | "day">("week")
  const [selectedShift, setSelectedShift] = useState<string>("all")

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const goToPreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1))
  }

  const goToNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1))
  }

  const getScheduleForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return mockScheduleData[dateKey] || {}
  }

  const getTotalStaffForDay = (date: Date) => {
    const schedule = getScheduleForDate(date)
    return Object.values(schedule).flat().length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Overview</h1>
          <p className="text-muted-foreground">
            View and manage staff schedules across all shifts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode */}
            <Select value={viewMode} onValueChange={(value: "week" | "day") => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
              </SelectContent>
            </Select>

            {/* Shift Filter */}
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      {viewMode === "week" ? (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const schedule = getScheduleForDate(day)
            const totalStaff = getTotalStaffForDay(day)
            
            return (
              <Card key={day.toISOString()} className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {format(day, "EEE")}
                      </CardTitle>
                      <CardDescription>
                        {format(day, "MMM dd")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {totalStaff}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(schedule).map(([shiftName, staff]) => {
                    const shift = shifts.find(s => s.name === shiftName)
                    if (selectedShift !== "all" && shift?.id !== selectedShift) return null
                    
                    return (
                      <div key={shiftName} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={shift?.color || "bg-gray-100 text-gray-800"}>
                            <Clock className="h-3 w-3 mr-1" />
                            {shiftName}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {(staff as any[]).map((person) => (
                            <div
                              key={person.id}
                              className="p-2 bg-gray-50 rounded-md text-sm"
                            >
                              <div className="font-medium">{person.name}</div>
                              <div className="text-xs text-gray-500">
                                {person.role} • {person.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  
                  {Object.keys(schedule).length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No shifts scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        // Day View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, "EEEE, MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shifts.map((shift) => {
                const schedule = getScheduleForDate(selectedDate)
                const shiftStaff = schedule[shift.name] || []
                
                if (selectedShift !== "all" && shift.id !== selectedShift) return null
                
                return (
                  <div key={shift.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={shift.color}>
                        <Clock className="h-3 w-3 mr-1" />
                        {shift.name}
                      </Badge>
                      <span className="text-sm text-gray-500">{shift.time}</span>
                      <Badge variant="outline">
                        {shiftStaff.length} staff
                      </Badge>
                    </div>
                    
                    {shiftStaff.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(shiftStaff as any[]).map((person) => (
                          <div
                            key={person.id}
                            className="p-3 border rounded-lg bg-white"
                          >
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-gray-500">{person.role}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {person.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg">
                        No staff assigned to this shift
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {weekDays.reduce((total, day) => total + getTotalStaffForDay(day), 0)}
                </div>
                <div className="text-sm text-gray-500">Total Staff Hours This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{shifts.length}</div>
                <div className="text-sm text-gray-500">Active Shifts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {weekDays.filter(day => getTotalStaffForDay(day) > 0).length}
                </div>
                <div className="text-sm text-gray-500">Days with Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 