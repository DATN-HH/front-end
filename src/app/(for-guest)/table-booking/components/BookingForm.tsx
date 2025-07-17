"use client"

import { Calendar, Users, User, Phone, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TableResponse } from "@/api/v1/tables"

interface BookingData {
  guests: number
  customerName: string
  customerPhone: string
  notes: string
}

interface BookingFormProps {
  bookingData: BookingData
  selectedTables: TableResponse[]
  selectedDate: string
  onBookingDataChange: (data: Partial<BookingData>) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting?: boolean
}

export function BookingForm({
  bookingData,
  selectedTables,
  selectedDate,
  onBookingDataChange,
  onSubmit,
  isSubmitting = false
}: BookingFormProps) {
  const maxCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, 0)
  const hasSelectedTables = selectedTables.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-4 h-4" />
          Booking Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="guests" className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Guests
            </Label>
            <Select
              value={bookingData.guests.toString()}
              onValueChange={(value) => onBookingDataChange({ guests: parseInt(value) })}
              disabled={!hasSelectedTables}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hasSelectedTables ? (
                  Array.from({ length: maxCapacity }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="2">2 people</SelectItem>
                )}
              </SelectContent>
            </Select>
            {hasSelectedTables && (
              <p className="text-xs text-gray-500">
                Maximum capacity: {maxCapacity} people across {selectedTables.length} table{selectedTables.length > 1 ? 's' : ''}
              </p>
            )}
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
                onChange={(e) => onBookingDataChange({ customerName: e.target.value })}
                disabled={!hasSelectedTables}
                required
                className="h-8"
                placeholder="Enter your full name"
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
                onChange={(e) => onBookingDataChange({ customerPhone: e.target.value })}
                disabled={!hasSelectedTables}
                required
                className="h-8"
                placeholder="0345888777"
                pattern="[0-9]{10,11}"
                title="Please enter a valid Vietnamese phone number (10-11 digits)"
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
              onChange={(e) => onBookingDataChange({ notes: e.target.value })}
              disabled={!hasSelectedTables}
              rows={2}
              className="text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 h-9"
            disabled={!hasSelectedTables || !selectedDate || isSubmitting}
          >
            {isSubmitting ? 'Creating Booking...' :
              !selectedDate ? 'Select Date & Time First' :
                !hasSelectedTables ? 'Select Table(s)' :
                  'Complete Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
