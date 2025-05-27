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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  CalendarIcon, 
  Copy, 
  ArrowRight,
  Users,
  Clock,
  AlertCircle
} from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Mock schedule data
const mockSchedules = {
  "2024-01-15": {
    "Morning Shift": [
      { id: 1, name: "John Doe", role: "Manager" },
      { id: 2, name: "Jane Smith", role: "Server" },
      { id: 3, name: "Mike Johnson", role: "Chef" },
    ],
    "Evening Shift": [
      { id: 4, name: "Sarah Wilson", role: "Server" },
      { id: 5, name: "Tom Brown", role: "Chef" },
    ]
  },
  "2024-01-16": {
    "Morning Shift": [
      { id: 1, name: "John Doe", role: "Manager" },
      { id: 6, name: "Lisa Davis", role: "Server" },
    ],
    "Evening Shift": [
      { id: 2, name: "Jane Smith", role: "Server" },
      { id: 7, name: "David Lee", role: "Chef" },
    ]
  },
}

export default function CopySchedulePage() {
  const { toast } = useToast()
  const [sourceWeek, setSourceWeek] = useState<Date>(new Date())
  const [targetWeek, setTargetWeek] = useState<Date>(addWeeks(new Date(), 1))
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ])
  const [selectedShifts, setSelectedShifts] = useState<string[]>([
    "morning", "evening", "night"
  ])
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  const sourceWeekStart = startOfWeek(sourceWeek, { weekStartsOn: 1 })
  const sourceWeekEnd = endOfWeek(sourceWeek, { weekStartsOn: 1 })
  const targetWeekStart = startOfWeek(targetWeek, { weekStartsOn: 1 })
  const targetWeekEnd = endOfWeek(targetWeek, { weekStartsOn: 1 })

  const days = [
    { id: "monday", name: "Monday", short: "Mon" },
    { id: "tuesday", name: "Tuesday", short: "Tue" },
    { id: "wednesday", name: "Wednesday", short: "Wed" },
    { id: "thursday", name: "Thursday", short: "Thu" },
    { id: "friday", name: "Friday", short: "Fri" },
    { id: "saturday", name: "Saturday", short: "Sat" },
    { id: "sunday", name: "Sunday", short: "Sun" },
  ]

  const shifts = [
    { id: "morning", name: "Morning Shift", time: "06:00 - 14:00", color: "bg-blue-100 text-blue-800" },
    { id: "evening", name: "Evening Shift", time: "14:00 - 22:00", color: "bg-purple-100 text-purple-800" },
    { id: "night", name: "Night Shift", time: "22:00 - 06:00", color: "bg-gray-100 text-gray-800" },
  ]

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    )
  }

  const handleShiftToggle = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) 
        ? prev.filter(s => s !== shiftId)
        : [...prev, shiftId]
    )
  }

  const handleSelectAllDays = () => {
    setSelectedDays(days.map(d => d.id))
  }

  const handleDeselectAllDays = () => {
    setSelectedDays([])
  }

  const handleSelectAllShifts = () => {
    setSelectedShifts(shifts.map(s => s.id))
  }

  const handleDeselectAllShifts = () => {
    setSelectedShifts([])
  }

  const handleCopySchedule = () => {
    if (selectedDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one day to copy.",
        variant: "destructive",
      })
      return
    }

    if (selectedShifts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one shift to copy.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Schedule Copied",
      description: `Successfully copied ${selectedDays.length} days and ${selectedShifts.length} shifts from ${format(sourceWeekStart, "MMM dd")} to ${format(targetWeekStart, "MMM dd")}.`,
    })
  }

  const getSchedulePreview = () => {
    // Mock preview data
    return {
      totalStaff: 15,
      totalShifts: selectedDays.length * selectedShifts.length,
      conflicts: overwriteExisting ? 0 : 3,
    }
  }

  const preview = getSchedulePreview()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Copy Schedule</h1>
          <p className="text-muted-foreground">
            Copy staff schedules from one week to another
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Source Week
            </CardTitle>
            <CardDescription>Select the week to copy from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sourceWeek && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(sourceWeekStart, "MMM dd")} - {format(sourceWeekEnd, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={sourceWeek}
                  onSelect={(date) => date && setSourceWeek(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Schedule Summary</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>12 staff assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>21 shifts covered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Target Week
            </CardTitle>
            <CardDescription>Select the week to copy to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetWeek && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(targetWeekStart, "MMM dd")} - {format(targetWeekEnd, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetWeek}
                  onSelect={(date) => date && setTargetWeek(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Schedule</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>8 staff assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>14 shifts covered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Copy Options */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Options</CardTitle>
          <CardDescription>Select which days and shifts to copy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Days Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Days to Copy</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAllDays}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllDays}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={day.id} className="text-sm font-medium cursor-pointer">
                    {day.short}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Shifts Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Shifts to Copy</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAllShifts}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllShifts}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {shifts.map((shift) => (
                <div key={shift.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={shift.id}
                    checked={selectedShifts.includes(shift.id)}
                    onCheckedChange={() => handleShiftToggle(shift.id)}
                  />
                  <Label htmlFor={shift.id} className="flex items-center gap-2 cursor-pointer">
                    <Badge className={shift.color}>
                      {shift.name}
                    </Badge>
                    <span className="text-sm text-gray-500">{shift.time}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite"
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(checked as boolean)}
              />
              <Label htmlFor="overwrite" className="text-sm cursor-pointer">
                Overwrite existing assignments in target week
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Preview</CardTitle>
          <CardDescription>Review what will be copied</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {format(sourceWeekStart, "MMM dd")}
                </div>
                <div className="text-sm text-gray-500">Source Week</div>
              </div>
              
              <ArrowRight className="h-8 w-8 text-gray-400" />
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {format(targetWeekStart, "MMM dd")}
                </div>
                <div className="text-sm text-gray-500">Target Week</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedDays.length}</div>
              <div className="text-sm text-gray-600">Days Selected</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{preview.totalShifts}</div>
              <div className="text-sm text-gray-600">Total Shifts</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{preview.totalStaff}</div>
              <div className="text-sm text-gray-600">Staff Assignments</div>
            </div>
          </div>

          {preview.conflicts > 0 && !overwriteExisting && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">
                    {preview.conflicts} potential conflicts detected
                  </div>
                  <div className="text-sm text-yellow-700">
                    Some shifts in the target week already have assignments. Enable "Overwrite existing assignments" to replace them.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleCopySchedule} disabled={selectedDays.length === 0 || selectedShifts.length === 0}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Schedule
        </Button>
      </div>
    </div>
  )
} 