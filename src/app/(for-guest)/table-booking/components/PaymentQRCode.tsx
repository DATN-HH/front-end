"use client"

import React, { useState, useEffect } from "react"
import { usePayOS } from "@payos/payos-checkout"
import { Button } from "@/components/ui/button"
import { QrCode, Loader2, CheckCircle } from "lucide-react"
import { useCreatePaymentLinkForBookingTable } from "@/api/v1/payment"
import { useCustomToast } from "@/lib/show-toast"

interface PaymentQRCodeProps {
  bookingId: number
  amount: number
  onPaymentSuccess?: () => void
}

export function PaymentQRCode({ bookingId, amount, onPaymentSuccess }: PaymentQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const { success, error } = useCustomToast()

  const createPaymentMutation = useCreatePaymentLinkForBookingTable()

  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: "https://example.com/payment/success",
    ELEMENT_ID: "embedded-payment-container",
    CHECKOUT_URL: null as string | null,
    embedded: true,
    onSuccess: (event: any) => {
      setIsOpen(false)
      setMessage("Payment successful!")
      success("Success", "Payment completed successfully")
      onPaymentSuccess?.()
    },
    onCancel: (event: any) => {
      setIsOpen(false)
      setMessage("Payment cancelled")
    },
    onError: (event: any) => {
      setIsOpen(false)
      setMessage("Payment failed")
      error("Payment Error", "Payment processing failed")
    }
  })

  const { open, exit } = usePayOS(payOSConfig)

  const handleGetPaymentLink = async () => {
    setIsCreatingLink(true)
    exit()
    
    try {
      const result = await createPaymentMutation.mutateAsync(bookingId)
      
      setPayOSConfig((oldConfig) => ({
        ...oldConfig,
        CHECKOUT_URL: result.checkoutUrl,
      }))

      setIsOpen(true)
      success("Success", "Payment link created successfully")
    } catch (err: any) {
      console.error("Payment link creation failed:", err)
      error("Error", "Failed to create payment link")
    } finally {
      setIsCreatingLink(false)
    }
  }

  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null) {
      exit()
      open()
    }
  }, [payOSConfig, open])

  if (message) {
    return (
      <div className="text-center p-6">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-lg font-medium text-green-600">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">Payment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Amount to pay: <span className="font-semibold text-green-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(amount)}
          </span>
        </p>
      </div>

      {!isOpen ? (
        <div className="text-center">
          {isCreatingLink ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Creating payment link...</span>
            </div>
          ) : (
            <Button
              onClick={handleGetPaymentLink}
              className="w-full"
              disabled={createPaymentMutation.isPending}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code Payment
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false)
              exit()
            }}
            className="w-full"
          >
            Close Payment
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            After successful payment, please wait 5-10 seconds for the system to automatically update.
          </div>
        </div>
      )}

      <div
        id="embedded-payment-container"
        className="min-h-[350px] border rounded-lg bg-gray-50"
        style={{
          height: isOpen ? "350px" : "auto",
          minHeight: isOpen ? "350px" : "100px"
        }}
      >
        {!isOpen && (
          <div className="flex items-center justify-center h-full py-8">
            <div className="text-center text-gray-400">
              <QrCode className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">QR code will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
