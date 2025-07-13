"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, MapPin, Building, User, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useBranches } from "@/api/v1/branches"
import { useFloorsByBranch } from "@/api/v1/floors"
import { useTablesByFloor, TableResponse } from "@/api/v1/tables"
import { FloorCanvas } from "@/app/(app-section)/app/settings/floor-management/[floorId]/components/FloorCanvas"
import { getIconByName } from "@/lib/icon-utils"
import { formatCurrency } from "@/api/v1/table-types"

interface BookingData {
  startTime: string
  guests: number
  notes: string
  branchId: number
  floorId: number
  tableId: number
  customerName: string
  customerPhone: string
}

export default function TableBookingPage() {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>({
    startTime: "",
    guests: 2,
    notes: "",
    branchId: 0,
    floorId: 0,
    tableId: 0,
    customerName: "John Doe", // Fake user data
    customerPhone: "+1 (555) 123-4567", // Fake user data
  })

  // API hooks
  const { data: branches = [], isLoading: branchesLoading } = useBranches()
  const { data: floors = [], isLoading: floorsLoading } = useFloorsByBranch(selectedBranch || 0)
  const { data: floorData, isLoading: tablesLoading } = useTablesByFloor(selectedFloor || 0)

  // Reset selections when parent changes
  useEffect(() => {
    setSelectedFloor(null)
    setSelectedTable(null)
  }, [selectedBranch])

  useEffect(() => {
    setSelectedTable(null)
  }, [selectedFloor])

  const handleBranchChange = (branchId: string) => {
    const id = parseInt(branchId)
    setSelectedBranch(id)
    setBookingData(prev => ({ ...prev, branchId: id }))
  }

  const handleFloorChange = (floorId: string) => {
    const id = parseInt(floorId)
    setSelectedFloor(id)
    setBookingData(prev => ({ ...prev, floorId: id }))
  }

  const handleTableSelect = (table: TableResponse | null) => {
    setSelectedTable(table)
    if (table) {
      setBookingData(prev => ({
        ...prev,
        tableId: table.id,
        guests: Math.min(prev.guests, table.capacity) // Ensure guests don't exceed table capacity
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTable) {
      alert("Please select a table first")
      return
    }

    // Here you would typically send the booking data to your API
    console.log("Booking data:", bookingData)
    alert("Booking submitted successfully!")
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = getIconByName(iconName)
    return <IconComponent className="w-4 h-4" />
  }

  const getSelectedBranch = () => {
    return branches.find(b => b.id === selectedBranch)
  }

  const getSelectedFloor = () => {
    return floors.find(f => f.id === selectedFloor)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Table Booking</h1>
        <p className="text-gray-600">Select a table and make your reservation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Location Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5" />
                Select Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Booking Form - Always Visible */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Date & Time
                  </Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                    disabled={!selectedTable}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Number of Guests
                  </Label>
                  <Select
                    value={bookingData.guests.toString()}
                    onValueChange={(value) => setBookingData(prev => ({ ...prev, guests: parseInt(value) }))}
                    disabled={!selectedTable}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                    disabled={!selectedTable}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    disabled={!selectedTable}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Special Requests
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or notes..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={!selectedTable}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={!selectedTable}
                >
                  {selectedTable ? 'Complete Booking' : 'Select a Table First'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Floor Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Floor Map
                {getSelectedBranch() && getSelectedFloor() && (
                  <div className="ml-auto text-sm text-gray-500 hidden sm:block">
                    {getSelectedBranch()?.name} - {getSelectedFloor()?.name}
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Click on a table to select it for booking
              </CardDescription>
            </CardHeader>

            {/* Selected Table Info - Between Description and Map */}
            {selectedTable && (
              <div className="mx-6 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-900">Selected Table</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Table</span>
                      <span className="font-semibold text-gray-900">{selectedTable.tableName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Capacity</span>
                      <Badge variant="secondary" className="font-semibold w-fit">
                        {selectedTable.capacity} people
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Type</span>
                      <div className="flex items-center gap-2">
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
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto mb-4" />
                    <p>Please select a branch first</p>
                  </div>
                </div>
              )}

              {selectedBranch && !selectedFloor && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto mb-4" />
                    <p>Please select a floor</p>
                  </div>
                </div>
              )}

              {selectedFloor && tablesLoading && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading floor map...</p>
                  </div>
                </div>
              )}

              {selectedFloor && floorData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <FloorCanvas
                    floor={floorData.floor}
                    tables={floorData.tables}
                    selectedTable={selectedTable}
                    onTableSelect={handleTableSelect}
                    onTableDrop={() => { }} // Disabled for guests
                    onTableResize={() => { }} // Disabled for guests
                    isDragging={false}
                    onDragStart={() => { }}
                    onDragEnd={() => { }}
                    modeView="booking"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
