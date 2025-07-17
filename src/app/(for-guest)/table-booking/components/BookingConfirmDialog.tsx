"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, CreditCard, Timer } from "lucide-react"
import { CreateBookingResponse } from "@/api/v1/table-booking"
import { formatCurrency } from "@/api/v1/table-types"
import { PaymentQRCode } from "./PaymentQRCode"

interface BookingConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingData: CreateBookingResponse | null
  onConfirm?: () => void
  onCancel?: () => void
  onPaymentSuccess?: () => void
}

export function BookingConfirmDialog({
  open,
  onOpenChange,
  bookingData,
  onConfirm,
  onCancel,
  onPaymentSuccess
}: BookingConfirmDialogProps) {
  // Don't return null here - let the dialog show even without data

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      // weekday: 'long',
      // year: 'numeric',
      // month: 'long',
      // day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatExpireTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800'
      case 'DEPOSIT_PAID':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'Booked'
      case 'DEPOSIT_PAID':
        return 'Deposit Paid'
      case 'COMPLETED':
        return 'Completed'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Confirm Booking Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!bookingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading booking details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Booking Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="text-lg font-semibold">#{bookingData.bookingId}</p>
                </div>
                <Badge className={getStatusColor(bookingData.bookingStatus)}>
                  {getStatusText(bookingData.bookingStatus)}
                </Badge>
              </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium">{bookingData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{bookingData.customerPhone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-medium">{formatDateTime(bookingData.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p className="font-medium">{formatDateTime(bookingData.endTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-medium">{bookingData.guests} people</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Payment Expires</p>
                  <p className="font-medium text-red-600">{formatExpireTime(bookingData.expireTime)}</p>
                </div>
              </div>
            </div>
            {bookingData.notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="font-medium">{bookingData.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Tables Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Booked Tables</h3>
            <div className="space-y-2">
              {bookingData.bookedTables.map((table, index) => (
                <div key={table.tableId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{table.tableName}</p>
                      <p className="text-sm text-gray-600">{table.tableType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(table.deposit)}</p>
                    <p className="text-xs text-gray-500">Deposit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total Deposit */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Total Deposit</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(bookingData.totalDeposit)}
            </span>
          </div>

          {/* Payment QR Code */}
          <div className="space-y-3">
            <PaymentQRCode
              bookingId={bookingData.bookingId}
              amount={bookingData.totalDeposit}
              onPaymentSuccess={onPaymentSuccess || onConfirm}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Close
            </Button>
            {onConfirm && (
              <Button
                onClick={onConfirm}
                className="flex-1"
              >
                Confirm
              </Button>
            )}
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
