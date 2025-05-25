"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { BookingData } from "@/lib/types"
import { tables } from "@/lib/table-data"

const branches = ["Downtown Location", "Mall Branch", "Airport Terminal", "Suburban Plaza"]

export default function TableBookingPage() {
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [bookingData, setBookingData] = useState<BookingData>({
    startTime: "",
    guests: 2,
    notes: "",
    branch: "",
    customerName: "John Doe", // Fake user data
    customerPhone: "+1 (555) 123-4567", // Fake user data
  })

  const handleTableSelect = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId)
    if (table && table.status === "available") {
      setSelectedTable(tableId)
      setBookingData((prev) => ({ ...prev, tableId }))
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Table Booking</h1>
        <p className="text-muted-foreground">Reserve your perfect dining experience</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Restaurant Floor Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Table</CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Reserved</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted/20 rounded-lg p-4 h-96 border-2 border-dashed border-muted">
              {/* Restaurant Layout Background */}
              <div className="absolute inset-4 bg-gradient-to-br from-muted/10 to-muted/30 rounded-lg">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  Kitchen
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  Entrance
                </div>
              </div>

              {/* Tables */}
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.id)}
                  disabled={table.status !== "available"}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-110 ${getTableStatusColor(
                    table.status,
                  )} ${selectedTable === table.id ? "ring-4 ring-primary ring-offset-2" : ""} ${
                    table.status !== "available" ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                  }}
                  title={`Table ${table.number} (${table.capacity} seats) - ${table.status}`}
                >
                  {table.number}
                </button>
              ))}
            </div>

            {selectedTable && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  Selected: Table {tables.find((t) => t.id === selectedTable)?.number}(
                  {tables.find((t) => t.id === selectedTable)?.capacity} seats)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info (Pre-filled) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={bookingData.customerPhone}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={bookingData.branch}
                onValueChange={(value) => setBookingData((prev) => ({ ...prev, branch: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.startTime.split("T")[0] || ""}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      startTime: e.target.value + "T" + (prev.startTime.split("T")[1] || "19:00"),
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={bookingData.startTime.split("T")[1] || ""}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      startTime: (prev.startTime.split("T")[0] || "") + "T" + e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* End Time (Optional) */}
            <div>
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={bookingData.endTime || ""}
                onChange={(e) => setBookingData((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>

            {/* Number of Guests */}
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Select
                value={bookingData.guests.toString()}
                onValueChange={(value) => setBookingData((prev) => ({ ...prev, guests: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Special Notes */}
            <div>
              <Label htmlFor="notes">Special Requests</Label>
              <Textarea
                id="notes"
                placeholder="Any special occasions, dietary requirements, or preferences..."
                value={bookingData.notes}
                onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1"
                size="lg"
                disabled={!selectedTable || !bookingData.startTime || !bookingData.branch}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Table
              </Button>
              <Button variant="outline" size="lg" onClick={() => (window.location.href = "/menu-booking")}>
                Pre-Order Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
