"use client"

import { useContext, useEffect, useMemo, useCallback, memo, lazy, Suspense, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ChevronLeft, ChevronRight, CalendarDays, Clock, Grid3X3 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns"
import { enUS } from "date-fns/locale"
import { useQueryClient } from '@tanstack/react-query'
import { useCustomToast } from '@/lib/show-toast'
import { useAuth } from '@/contexts/auth-context'
import dayjs from 'dayjs'
import { ScheduleContext } from "@/features/scheduling/contexts/context-schedule"

// Lazy load heavy components for better performance
const EmployeeTimeline = lazy(() => import("./EmployeeTimeline"))
const UnifiedSchedule = lazy(() => import("./UnifiedSchedule"))

// Memoized view mode options
const VIEW_MODE_OPTIONS = [
  { value: "daily", label: "Daily View", icon: Clock },
  { value: "weekly", label: "Weekly View", icon: CalendarDays },
  { value: "monthly", label: "Monthly View", icon: Grid3X3 },
] as const

// Memoized skeleton components
const DailySkeleton = memo(() => (
  <div className="p-6 space-y-6">
    {/* Timeline header skeleton */}
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>

    {/* Employee rows skeleton */}
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="ml-14 space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    ))}
  </div>
))
DailySkeleton.displayName = 'DailySkeleton'

const WeeklySkeleton = memo(() => (
  <div className="p-6 space-y-4">
    {/* Weekly header skeleton */}
    <div className="grid grid-cols-8 gap-4 mb-6">
      <Skeleton className="h-6 w-20" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="text-center">
          <Skeleton className="h-4 w-12 mx-auto mb-1" />
          <Skeleton className="h-6 w-6 mx-auto" />
        </div>
      ))}
    </div>

    {/* Employee rows skeleton */}
    {Array.from({ length: 6 }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-8 gap-4 items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 7 }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-20 w-full" />
        ))}
      </div>
    ))}
  </div>
))
WeeklySkeleton.displayName = 'WeeklySkeleton'

const MonthlySkeleton = memo(() => (
  <div className="p-6 space-y-4">
    {/* Monthly header skeleton */}
    <div className="grid grid-cols-7 gap-2 mb-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>

    {/* Calendar grid skeleton */}
    {Array.from({ length: 5 }).map((_, weekIndex) => (
      <div key={weekIndex} className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={dayIndex} className="border rounded-lg p-2 h-24 space-y-1">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    ))}
  </div>
))
MonthlySkeleton.displayName = 'MonthlySkeleton'

const DefaultSkeleton = memo(() => (
  <div className="p-6 space-y-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    ))}
  </div>
))
DefaultSkeleton.displayName = 'DefaultSkeleton'

function ScheduleManager() {
  const {
    selectedDate,
    setSelectedDate,
    setStartDate,
    setEndDate,
    viewMode,
    setViewMode,
    shifts,
    isLoadingShifts,
    scheduledShifts,
    isLoadingScheduledShifts,
    scheduledShiftsGrouped,
    isLoadingScheduledShiftsGrouped,
  } = useContext(ScheduleContext)

  const queryClient = useQueryClient()
  const { success, error } = useCustomToast()
  const { user } = useAuth()

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Memoized computed values
  const isLoading = useMemo(() =>
    isLoadingShifts || isLoadingScheduledShifts || isLoadingScheduledShiftsGrouped || isRefreshing,
    [isLoadingShifts, isLoadingScheduledShifts, isLoadingScheduledShiftsGrouped, isRefreshing]
  )

  const dataCounts = useMemo(() => ({
    shifts: shifts?.length || 0,
    scheduledShifts: scheduledShifts?.length || 0,
    scheduledShiftsGrouped: scheduledShiftsGrouped?.length || 0,
  }), [shifts?.length, scheduledShifts?.length, scheduledShiftsGrouped?.length])

  const displayText = useMemo(() => {
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
  }, [selectedDate, viewMode])

  // Memoized date range calculation
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case "daily":
        return { startDate: selectedDate, endDate: selectedDate }
      case "weekly":
        return {
          startDate: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          endDate: endOfWeek(selectedDate, { weekStartsOn: 1 })
        }
      case "monthly":
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        return { startDate: monthStart, endDate: monthEnd }
      default:
        return { startDate: selectedDate, endDate: selectedDate }
    }
  }, [selectedDate, viewMode])

  // Debounce date updates for better performance
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  // Update start and end dates when date range changes (debounced)
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced update
    debounceTimeoutRef.current = setTimeout(() => {
      setStartDate(dateRange.startDate)
      setEndDate(dateRange.endDate)
    }, 150) // 150ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [dateRange.startDate, dateRange.endDate, setStartDate, setEndDate])

  // Memoized event handlers with actual refresh functionality
  const handleRefresh = useCallback(async () => {
    if (!user?.branch?.id || isRefreshing) return

    setIsRefreshing(true)

    try {
      const branchId = user.branch.id
      const formattedStartDate = dayjs(dateRange.startDate).format("YYYY-MM-DD")
      const formattedEndDate = dayjs(dateRange.endDate).format("YYYY-MM-DD")

      // Invalidate all schedule-related queries
      const invalidatePromises = [
        // Shifts data
        queryClient.invalidateQueries({ queryKey: ['shifts', branchId] }),

        // Scheduled shifts data  
        queryClient.invalidateQueries({
          queryKey: ['scheduled-shifts', {
            branchId,
            startDate: formattedStartDate,
            endDate: formattedEndDate
          }]
        }),

        // Scheduled shifts grouped data
        queryClient.invalidateQueries({
          queryKey: ['scheduled-shifts', 'grouped', {
            branchId,
            startDate: formattedStartDate,
            endDate: formattedEndDate
          }]
        }),

        // Staff shifts grouped data
        queryClient.invalidateQueries({
          queryKey: ['staff-shifts-grouped', {
            branchId,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            size: 1000000
          }]
        }),

        // Roles data
        queryClient.invalidateQueries({ queryKey: ['roles'] }),

        // Additional schedule-related queries
        queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
        queryClient.invalidateQueries({ queryKey: ['schedule-locks', branchId] }),
        queryClient.invalidateQueries({ queryKey: ['schedule-lock-check'] }),
      ]

      // Wait for all invalidations to complete
      await Promise.allSettled(invalidatePromises)

      success('Refresh Complete', 'Schedule data has been refreshed successfully')

    } catch (err: any) {
      console.error('Refresh failed:', err)
      error('Refresh Failed', 'Failed to refresh schedule data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }, [user?.branch?.id, isRefreshing, dateRange.startDate, dateRange.endDate, queryClient, success, error])

  const handlePrevious = useCallback(() => {
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
  }, [viewMode, selectedDate, setSelectedDate])

  const handleNext = useCallback(() => {
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
  }, [viewMode, selectedDate, setSelectedDate])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }, [setSelectedDate])

  const handleViewModeChange = useCallback((value: string) => {
    setViewMode(value as "daily" | "weekly" | "monthly")
  }, [setViewMode])

  // Memoized skeleton renderer
  const renderLoadingSkeleton = useCallback(() => {
    switch (viewMode) {
      case "daily":
        return <DailySkeleton />
      case "weekly":
        return <WeeklySkeleton />
      case "monthly":
        return <MonthlySkeleton />
      default:
        return <DefaultSkeleton />
    }
  }, [viewMode])

  // Memoized content renderer with Suspense for lazy loading
  const renderContent = useCallback(() => {
    if (isLoading) {
      return renderLoadingSkeleton()
    }

    const LazyComponent = () => {
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
      <Suspense fallback={renderLoadingSkeleton()}>
        <LazyComponent />
      </Suspense>
    )
  }, [isLoading, viewMode, renderLoadingSkeleton])

  return (
    <div className="w-full p-3">
      <div className="flex items-center space-x-4 mb-4">
        {/* View Mode Selector */}
        <Select value={viewMode} onValueChange={handleViewModeChange}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 hover:border-slate-300 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {useMemo(() =>
              VIEW_MODE_OPTIONS.map((option) => {
                const IconComponent = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                )
              }), []
            )}
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
                {displayText}
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
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 text-primary ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
        </Button>

        {/* Data indicator */}
        {useMemo(() => (
          <div className="text-xs text-gray-500 hidden lg:block">
            {dataCounts.shifts > 0 && `${dataCounts.shifts} shifts`}
            {dataCounts.scheduledShifts > 0 && ` • ${dataCounts.scheduledShifts} scheduled shifts`}
          </div>
        ), [dataCounts.shifts, dataCounts.scheduledShifts])}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}

export default memo(ScheduleManager)
