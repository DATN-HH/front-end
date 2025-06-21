"use client"

import { useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronLeft, ChevronRight, CalendarDays, Clock, Grid3X3 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns"
import { enUS } from "date-fns/locale"
import EmployeeTimeline from "./EmployeeTimeline"
import UnifiedSchedule from "./UnifiedSchedule"
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"

export default function ScheduleManager() {
  const {
    selectedDate,
    setSelectedDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    viewMode,
    setViewMode,
    shifts,
    isLoadingShifts,
    scheduledShifts,
    isLoadingScheduledShifts,
    scheduledShiftsGrouped,
    isLoadingScheduledShiftsGrouped,
    staffShiftsGrouped,
    isLoadingStaffShiftsGrouped
  } = useContext(ScheduleContext)

  // Update start and end dates when selected date or view mode changes
  useEffect(() => {
    switch (viewMode) {
      case "daily":
        setStartDate(selectedDate)
        setEndDate(selectedDate)
        break
      case "weekly":
        setStartDate(startOfWeek(selectedDate, { weekStartsOn: 1 }))
        setEndDate(endOfWeek(selectedDate, { weekStartsOn: 1 }))
        break
      case "monthly":
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        setStartDate(monthStart)
        setEndDate(monthEnd)
        break
    }
  }, [selectedDate, viewMode, setStartDate, setEndDate])

  const handleRefresh = () => {
    // The data will automatically refresh through the API queries in the context
    console.log("Refreshing data...")
  }

  const getDisplayText = () => {
    switch (viewMode) {
      case "daily":
        return format(selectedDate, "EEEE, dd/MM/yyyy", { locale: enUS })
      case "weekly":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
        return `${format(weekStart, "dd/MM", { locale: enUS })} - ${format(weekEnd, "dd/MM/yyyy", { locale: enUS })}`
      case "monthly":
        return format(selectedDate, "MMMM yyyy", { locale: enUS })
      default:
        return ""
    }
  }

  const handlePrevious = () => {
    switch (viewMode) {
      case "daily":
        setSelectedDate(subDays(selectedDate, 1))
        break
      case "weekly":
        setSelectedDate(subWeeks(selectedDate, 1))
        break
      case "monthly":
        setSelectedDate(subMonths(selectedDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case "daily":
        setSelectedDate(addDays(selectedDate, 1))
        break
      case "weekly":
        setSelectedDate(addWeeks(selectedDate, 1))
        break
      case "monthly":
        setSelectedDate(addMonths(selectedDate, 1))
        break
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const viewModeOptions = [
    { value: "daily", label: "Daily View", icon: Clock },
    { value: "weekly", label: "Weekly View", icon: CalendarDays },
    { value: "monthly", label: "Monthly View", icon: Grid3X3 },
  ]

  const renderContent = () => {
    const isLoading = isLoadingShifts || isLoadingScheduledShifts || isLoadingScheduledShiftsGrouped

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading schedule data...</span>
          </div>
        </div>
      )
    }

    switch (viewMode) {
      case "daily":
        return <EmployeeTimeline />
      case "weekly":
        return <UnifiedSchedule viewMode="weekly" />
      case "monthly":
        return <UnifiedSchedule viewMode="monthly" />
      default:
        return <EmployeeTimeline />
    }
  }

  const getDataCounts = () => {
    return {
      shifts: shifts?.length || 0,
      scheduledShifts: scheduledShifts?.length || 0,
      scheduledShiftsGrouped: scheduledShiftsGrouped?.length || 0,
    }
  }

  const dataCounts = getDataCounts()

  return (
    <div className="w-full p-3">
      <div className="flex items-center space-x-4 mb-4">
        {/* View Mode Selector */}
        <Select value={viewMode} onValueChange={(value) => setViewMode(value as "daily" | "weekly" | "monthly")}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 hover:border-slate-300 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {viewModeOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Date Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-4 font-medium min-w-[200px] justify-center"
              >
                {getDisplayText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="h-9"
          disabled={isLoadingShifts || isLoadingScheduledShifts || isLoadingScheduledShiftsGrouped}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(isLoadingShifts || isLoadingScheduledShifts || isLoadingScheduledShiftsGrouped) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        {/* Data indicator */}
        <div className="text-xs text-gray-500 hidden lg:block">
          {dataCounts.shifts > 0 && `${dataCounts.shifts} shifts`}
          {dataCounts.scheduledShifts > 0 && ` • ${dataCounts.scheduledShifts} scheduled shifts`}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}
