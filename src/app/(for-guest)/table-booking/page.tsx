"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, Users, MapPin, Building, User, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useBranches } from "@/api/v1/branches"
import { useFloorsByBranch } from "@/api/v1/floors"
import { useTablesByFloor, TableResponse } from "@/api/v1/tables"
import { FloorCanvas } from "@/app/(app-section)/app/settings/floor-management/[floorId]/components/FloorCanvas"
import { getIconByName } from "@/lib/icon-utils"
import { formatCurrency } from "@/api/v1/table-types"
import {
  useFloorTablesStatus,
  formatDateTime,
  TableStatus,
  AvailableTable
} from "@/api/v1/table-status"


interface BookingData {
  startTime: string
  duration: number // Duration in hours
  guests: number
  notes: string
  branchId: number
  floorId: number
  tableId: number
  customerName: string
  customerPhone: string
}

export default function TableBookingPage() {
  // Basic selection state
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null)

  // Separate date and hour selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0]
  })
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    // Default to current hour + 1
    const now = new Date()
    return (now.getHours() + 1) % 24
  })

  const [bookingData, setBookingData] = useState<BookingData>({
    startTime: "",
    duration: 1, // Default 2 hours
    guests: 2,
    notes: "",
    branchId: 0,
    floorId: 0,
    tableId: 0,
    customerName: "John Doe", // Fake user data
    customerPhone: "0345888777", // Fake user data
  })

  // API hooks for basic data
  const { data: branches = [], isLoading: branchesLoading } = useBranches()
  const { data: floors = [], isLoading: floorsLoading } = useFloorsByBranch(selectedBranch || 0)
  const { data: floorData, isLoading: tablesLoading } = useTablesByFloor(selectedFloor || 0)

  // Compute selectedDateTime string directly without timezone conversion
  const selectedDateTimeString = useMemo(() => {
    if (!selectedDate) return ''
    // Create datetime string directly: YYYY-MM-DDTHH:mm:ss
    const hourString = selectedHour.toString().padStart(2, '0')
    return `${selectedDate}T${hourString}:00:00`
  }, [selectedDate, selectedHour])

  // Create Date object for other uses (like booking data)
  const selectedDateTime = useMemo(() => {
    if (!selectedDate) return null
    const [year, month, day] = selectedDate.split('-').map(Number)
    const dateTime = new Date(year, month - 1, day, selectedHour, 0, 0, 0)
    return dateTime
  }, [selectedDate, selectedHour])

  // API hooks for floor tables status - use the string directly
  const formattedDateTime = selectedDateTimeString

  const {
    data: floorTablesStatus,
    isLoading: floorStatusLoading,
    error: floorStatusError
  } = useFloorTablesStatus(
    selectedFloor ?? 0,
    formattedDateTime,
    bookingData.duration,
    !!(selectedFloor && selectedDate && formattedDateTime && bookingData.duration)
  )

  // Reset selections when parent changes
  useEffect(() => {
    setSelectedFloor(null)
    setSelectedTable(null)
    // Reset to default date and hour
    setSelectedDate(new Date().toISOString().split('T')[0])
    setSelectedHour((new Date().getHours() + 1) % 24)
  }, [selectedBranch])

  useEffect(() => {
    setSelectedTable(null)
  }, [selectedFloor])

  // Update booking data when selections change
  useEffect(() => {
    if (selectedDateTime) {
      setBookingData(prev => ({
        ...prev,
        startTime: selectedDateTime.toISOString().slice(0, 16)
      }))
    }
  }, [selectedDateTime])

  const handleBranchChange = useCallback((branchId: string) => {
    const id = parseInt(branchId)
    setSelectedBranch(id)
    setBookingData(prev => ({ ...prev, branchId: id }))
  }, [])

  const handleFloorChange = useCallback((floorId: string) => {
    const id = parseInt(floorId)
    setSelectedFloor(id)
    setBookingData(prev => ({ ...prev, floorId: id }))
  }, [])

  const handleDateChange = useCallback((dateValue: string) => {
    setSelectedDate(dateValue)
  }, [])

  const handleHourChange = useCallback((hourValue: string) => {
    setSelectedHour(parseInt(hourValue))
  }, [])

  const handleTableSelect = useCallback((table: TableResponse | null) => {
    setSelectedTable(table)
    if (table) {
      setBookingData(prev => ({
        ...prev,
        tableId: table.id,
        guests: Math.min(prev.guests, table.capacity)
      }))
    }
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTable || !selectedDate) {
      alert("Please select a table and date/time first")
      return
    }

    console.log("Booking data:", {
      ...bookingData,
      endTime: selectedDateTime ? new Date(selectedDateTime.getTime() + bookingData.duration * 60 * 60 * 1000).toISOString() : null
    })
    alert(`Booking submitted successfully for ${bookingData.duration} hour${bookingData.duration > 1 ? 's' : ''}!`)
  }, [selectedTable, selectedDate, bookingData, selectedDateTime])

  const renderIcon = useCallback((iconName: string) => {
    const IconComponent = getIconByName(iconName)
    return <IconComponent className="w-4 h-4" />
  }, [])

  const selectedBranchData = useMemo(() => {
    return branches.find(b => b.id === selectedBranch)
  }, [branches, selectedBranch])

  const selectedFloorData = useMemo(() => {
    return floors.find(f => f.id === selectedFloor)
  }, [floors, selectedFloor])

  // Get selectable tables based on current date/time selection
  const selectableTables = useMemo((): number[] | undefined => {
    if (!floorTablesStatus?.success || !selectedDate) {
      return undefined // If no API data or no time selection, all tables are selectable
    }

    // Return array of table IDs that are available at the selected time
    return floorTablesStatus.payload.availableTablesList
      .filter((t: AvailableTable) => t.currentStatus === TableStatus.AVAILABLE)
      .map((t: AvailableTable) => t.tableId)
  }, [floorTablesStatus, selectedDate])

  // Enhanced FloorCanvas that uses table status
  const renderFloorCanvas = useMemo(() => {
    if (!floorData) return null

    return (
      <FloorCanvas
        floor={floorData.floor}
        tables={floorData.tables}
        selectedTable={selectedTable}
        onTableSelect={handleTableSelect}
        onTableDrop={() => { }}
        onTableResize={() => { }}
        isDragging={false}
        onDragStart={() => { }}
        onDragEnd={() => { }}
        modeView="booking"
        selectableTables={selectableTables}
      />
    )
  }, [floorData, selectedTable, selectableTables, handleTableSelect])

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">Table Booking</h1>
        <p className="text-gray-600 text-sm">Select date, time and table for your reservation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Location Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="w-4 h-4" />
                Select Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Branch Selection */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={selectedBranch?.toString() || ""}
                  onValueChange={handleBranchChange}
                  disabled={branchesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={branchesLoading ? "Loading..." : "Select a branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{branch.name}</div>
                            {branch.address && (
                              <div className="text-sm text-gray-500">{branch.address}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Floor Selection */}
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Select
                  value={selectedFloor?.toString() || ""}
                  onValueChange={handleFloorChange}
                  disabled={floorsLoading || !selectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedBranch
                        ? "Select a branch first"
                        : floorsLoading
                          ? "Loading..."
                          : "Select a floor"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {floor.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-sm">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={!selectedFloor}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hour" className="text-sm">Hour</Label>
                  <Select
                    value={selectedHour.toString()}
                    onValueChange={handleHourChange}
                    disabled={!selectedFloor}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Duration</Label>
                <RadioGroup
                  value={bookingData.duration.toString()}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: parseInt(value) }))}
                  disabled={!selectedFloor}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="duration-1" />
                    <Label htmlFor="duration-1" className="text-sm cursor-pointer">1 hour</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="duration-2" />
                    <Label htmlFor="duration-2" className="text-sm cursor-pointer">2 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="duration-3" />
                    <Label htmlFor="duration-3" className="text-sm cursor-pointer">3 hours</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">

                <div className="space-y-1">
                  <Label htmlFor="guests" className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    Guests
                  </Label>
                  <Select
                    value={bookingData.guests.toString()}
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, guests: parseInt(value) }))}
                    disabled={!selectedTable}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTable ? (
                        Array.from({ length: selectedTable.capacity }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="2">2 people</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="customerName" className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      Name
                    </Label>
                    <Input
                      id="customerName"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                      disabled={!selectedTable}
                      required
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="customerPhone" className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={bookingData.customerPhone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      disabled={!selectedTable}
                      required
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Special requests..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={!selectedTable}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 h-9"
                  disabled={!selectedTable || !selectedDate}
                >
                  {!selectedDate ? 'Select Date & Time First' :
                    !selectedTable ? 'Select a Table' :
                      'Complete Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Floor Map and Status */}
        <div className="lg:col-span-2 space-y-4">
          {/* Floor Map */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="w-4 h-4" />
                Floor Map
                {selectedBranchData && selectedFloorData && (
                  <div className="ml-auto text-xs text-gray-500 hidden sm:block">
                    {selectedBranchData?.name} - {selectedFloorData?.name}
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                Select date/time first, then choose an available table
              </CardDescription>
            </CardHeader>

            {/* Selected Table Info */}
            {selectedTable && (
              <div className="mx-4 mb-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-900">Selected Table</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Table</span>
                      <span className="font-semibold text-gray-900">{selectedTable.tableName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Capacity</span>
                      <Badge variant="secondary" className="font-semibold w-fit text-xs h-5">
                        {selectedTable.capacity} people
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Type</span>
                      <div className="flex items-center gap-1">
                        {renderIcon(selectedTable.tableType.icon)}
                        <span className="font-semibold text-gray-900">{selectedTable.tableType.tableType}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Deposit</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedTable.tableType.depositForBooking)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CardContent>
              {!selectedBranch && (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <Building className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Please select a branch first</p>
                  </div>
                </div>
              )}

              {selectedBranch && !selectedFloor && (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <Building className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Please select a floor</p>
                  </div>
                </div>
              )}

              {selectedFloor && tablesLoading && (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm">Loading floor map...</p>
                  </div>
                </div>
              )}

              {selectedFloor && floorData && (
                <div className="bg-gray-50 rounded-lg p-3">
                  {renderFloorCanvas}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
