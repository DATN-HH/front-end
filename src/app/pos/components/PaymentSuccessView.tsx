'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  Printer, 
  Mail, 
  FileText, 
  ArrowRightCircle,
  Loader2
} from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';
import { useToast } from '@/hooks/use-toast';
import { 
  useGenerateReceipt, 
  useEmailReceipt, 
  useGenerateInvoice,
  PaymentValidateResponse 
} from '@/api/v1/pos/payments';

interface PaymentSuccessViewProps {
  paymentResponse: PaymentValidateResponse;
  onNewOrder: () => void;
}

export function PaymentSuccessView({ paymentResponse, onNewOrder }: PaymentSuccessViewProps) {
  const { toast } = useToast();
  const { selectedCustomer, clearOrder } = usePosStore();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState(selectedCustomer?.email || '');

  const generateReceiptMutation = useGenerateReceipt();
  const emailReceiptMutation = useEmailReceipt();
  const generateInvoiceMutation = useGenerateInvoice();

  const handlePrintReceipt = async () => {
    try {
      const response = await generateReceiptMutation.mutateAsync({
        orderId: 1, // This should be the actual order ID
        format: 'thermal'
      });

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt - ${response.orderNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 20px;
                white-space: pre-line;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>
            ${response.content.replace(/\n/g, '<br>')}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: 'Receipt Printed',
        description: `Receipt for order ${response.orderNumber} sent to printer`,
      });
    } catch (error) {
      console.error('Print receipt error:', error);
      toast({
        title: 'Print Failed',
        description: 'Failed to print receipt. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEmailReceipt = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await emailReceiptMutation.mutateAsync({
        orderId: 1, // This should be the actual order ID
        emailAddress
      });

      toast({
        title: 'Receipt Sent',
        description: `Receipt emailed to ${emailAddress}`,
      });

      setShowEmailModal(false);
      setEmailAddress('');
    } catch (error) {
      console.error('Email receipt error:', error);
      toast({
        title: 'Email Failed',
        description: 'Failed to send receipt. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Customer Required',
        description: 'A customer must be selected to generate an invoice',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await generateInvoiceMutation.mutateAsync(1); // Order ID

      // Open invoice in new tab
      const invoiceWindow = window.open('', '_blank');
      if (invoiceWindow) {
        invoiceWindow.document.write(response.content);
        invoiceWindow.document.close();
      }

      toast({
        title: 'Invoice Generated',
        description: `Invoice ${response.receiptNumber} created successfully`,
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      toast({
        title: 'Invoice Failed',
        description: 'Failed to generate invoice. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleNewOrder = () => {
    clearOrder();
    onNewOrder();
  };

  return (
    <>
      <div className="flex-shrink-0 border-t bg-white p-6">
        {/* Success Indication */}
        <div className="text-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <div className="space-y-1 text-gray-600">
            <p className="text-lg font-medium">
              Order #{paymentResponse.orderNumber}
            </p>
            <p>Total Paid: <span className="font-semibold text-green-600">
              ${paymentResponse.totalPaid.toFixed(2)}
            </span></p>
            {paymentResponse.changeAmount && paymentResponse.changeAmount > 0 && (
              <p>Change Due: <span className="font-semibold text-orange-600">
                ${paymentResponse.changeAmount.toFixed(2)}
              </span></p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Print Receipt */}
          <Button
            onClick={handlePrintReceipt}
            disabled={generateReceiptMutation.isPending}
            variant="outline"
            className="w-full h-12 text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-700"
          >
            {generateReceiptMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="h-5 w-5 mr-2 text-orange-600" />
                Print Receipt
              </>
            )}
          </Button>

          {/* Email Receipt */}
          <Button
            onClick={() => setShowEmailModal(true)}
            variant="outline"
            className="w-full h-12 text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-700"
          >
            <Mail className="h-5 w-5 mr-2 text-orange-600" />
            Email Receipt
          </Button>

          {/* Generate Invoice - Only if customer selected */}
          {selectedCustomer && (
            <Button
              onClick={handleGenerateInvoice}
              disabled={generateInvoiceMutation.isPending}
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-700"
            >
              {generateInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  Generate Invoice
                </>
              )}
            </Button>
          )}
        </div>

        {/* New Order Button */}
        <Button
          onClick={handleNewOrder}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 text-lg font-semibold"
        >
          <ArrowRightCircle className="h-6 w-6 mr-2" />
          NEW ORDER
        </Button>
      </div>

      {/* Email Receipt Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-orange-600" />
              Email Receipt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Send receipt for order #{paymentResponse.orderNumber} to:
              </p>
              <Input
                type="email"
                placeholder="customer@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(false)}
                className="flex-1"
                disabled={emailReceiptMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailReceipt}
                disabled={emailReceiptMutation.isPending || !emailAddress}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {emailReceiptMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Receipt'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}