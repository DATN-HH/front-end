"use client"

import { useState } from "react"
import { Clock, MapPin, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { OrderData } from "@/lib/types"

const branches = ["Downtown Location", "Mall Branch", "Airport Terminal", "Suburban Plaza"]

export default function MenuBookingPage() {
  const [orderData, setOrderData] = useState<OrderData>({
    type: "dine-in",
    notes: "",
    scheduledTime: "",
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Pre-Order Menu</h1>
        <p className="text-muted-foreground">Order ahead and skip the wait</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Type */}
            <div>
              <Label className="text-base font-medium">Order Type</Label>
              <RadioGroup
                value={orderData.type}
                onValueChange={(value) => setOrderData((prev) => ({ ...prev, type: value as any }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Dine In
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Takeaway
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Branch Selection */}
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={orderData.branch || ""}
                onValueChange={(value) => setOrderData((prev) => ({ ...prev, branch: value }))}
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

            {/* Delivery Address */}
            {orderData.type === "delivery" && (
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full delivery address"
                  value={orderData.address || ""}
                  onChange={(e) => setOrderData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            )}

            {/* Scheduled Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={orderData.scheduledTime?.split("T")[0] || ""}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      scheduledTime: e.target.value + "T" + (prev.scheduledTime?.split("T")[1] || "12:00"),
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={orderData.scheduledTime?.split("T")[1] || ""}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      scheduledTime: (prev.scheduledTime?.split("T")[0] || "") + "T" + e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests, dietary requirements, or preparation notes..."
                value={orderData.notes || ""}
                onChange={(e) => setOrderData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => (window.location.href = "/menu")}
                disabled={!orderData.branch || !orderData.scheduledTime}
              >
                Continue to Menu
              </Button>
              <Button variant="outline" size="lg" onClick={() => (window.location.href = "/table-booking")}>
                Book Table Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
