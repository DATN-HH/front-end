"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DateTimeSelectorProps {
  selectedDate: string
  selectedHour: number
  duration: number
  onDateChange: (date: string) => void
  onHourChange: (hour: string) => void
  onDurationChange: (duration: number) => void
  disabled: boolean
}

export function DateTimeSelector({
  selectedDate,
  selectedHour,
  duration,
  onDateChange,
  onHourChange,
  onDurationChange,
  disabled
}: DateTimeSelectorProps) {
  return (
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
              onChange={(e) => onDateChange(e.target.value)}
              disabled={disabled}
              required
              min={new Date().toISOString().split('T')[0]}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hour" className="text-sm">Hour</Label>
            <Select
              value={selectedHour.toString()}
              onValueChange={onHourChange}
              disabled={disabled}
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
            value={duration.toString()}
            onValueChange={(value) => onDurationChange(parseInt(value))}
            disabled={disabled}
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
  )
}
