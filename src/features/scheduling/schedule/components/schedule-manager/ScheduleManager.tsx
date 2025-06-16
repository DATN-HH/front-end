"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronLeft, ChevronRight, CalendarDays, Clock, Grid3X3, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns"
import { enUS } from "date-fns/locale"
import { PageTitle } from "@/components/layouts/app-section/page-title"
import EmployeeTimeline from "./EmployeeTimeline"
import UnifiedSchedule from "./UnifiedSchedule"

export default function ScheduleManager() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily")

  const handleRefresh = () => {
    console.log("Refreshing data...")
  }

  const getDisplayText = () => {
    switch (viewMode) {
      case "daily":
        return format(currentDate, "EEEE, dd/MM/yyyy", { locale: enUS })
      case "weekly":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `${format(weekStart, "dd/MM", { locale: enUS })} - ${format(weekEnd, "dd/MM/yyyy", { locale: enUS })}`
      case "monthly":
        return format(currentDate, "MMMM yyyy", { locale: enUS })
      default:
        return ""
    }
  }

  const handlePrevious = () => {
    switch (viewMode) {
      case "daily":
        setCurrentDate(subDays(currentDate, 1))
        break
      case "weekly":
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case "monthly":
        setCurrentDate(subMonths(currentDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case "daily":
        setCurrentDate(addDays(currentDate, 1))
        break
      case "weekly":
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case "monthly":
        setCurrentDate(addMonths(currentDate, 1))
        break
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
    }
  }

  const viewModeOptions = [
    { value: "daily", label: "Daily View", icon: Clock },
    { value: "weekly", label: "Weekly View", icon: CalendarDays },
    { value: "monthly", label: "Monthly View", icon: Grid3X3 },
  ]

  const renderContent = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <PageTitle
        icon={Calendar}
        title="Schedule Manager"
        left={
          <div className="flex items-center space-x-4">
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
                    selected={currentDate}
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
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Full Width Schedule Content */}
      <div className="w-full p-3">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
