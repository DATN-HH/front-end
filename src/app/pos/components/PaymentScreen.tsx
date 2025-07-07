'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Heart, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Gift,
  CheckCircle,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';
import { useToast } from '@/hooks/use-toast';
import { 
  useInitiatePayment, 
  useValidatePayment,
  PaymentInitiateRequest,
  PaymentValidateRequest
} from '@/api/v1/pos/payments';

interface PaymentScreenProps {
  onTipClick: () => void;
  onCustomerClick: () => void;
  onPaymentSuccess: (response: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_PAYMENT' | 'GIFT_CARD';

export function PaymentScreen({ onTipClick, onCustomerClick, onPaymentSuccess, isCollapsed = false, onToggleCollapse }: PaymentScreenProps) {
  const { toast } = useToast();
  const {
    selectedCustomer,
    getSubtotal,
    getTax,
    getTotal,
    currentOrder
  } = usePosStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState(0); // This will be managed by the tip modal

  const initiatePaymentMutation = useInitiatePayment();
  const validatePaymentMutation = useValidatePayment();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const cashValue = parseFloat(cashTendered) || 0;
  const finalTotal = total + tipAmount;
  const change = cashValue - finalTotal;

  // Payment method options
  const paymentMethods = [
    { id: 'CASH' as PaymentMethod, name: 'Cash', icon: DollarSign, color: 'bg-green-600' },
    { id: 'CARD' as PaymentMethod, name: 'Card', icon: CreditCard, color: 'bg-blue-600' },
    { id: 'MOBILE_PAYMENT' as PaymentMethod, name: 'Mobile Pay', icon: Smartphone, color: 'bg-purple-600' },
    { id: 'GIFT_CARD' as PaymentMethod, name: 'Gift Card', icon: Gift, color: 'bg-pink-600' },
  ];

  // Quick cash amounts
  const quickCashAmounts = [
    finalTotal,
    Math.ceil(finalTotal),
    Math.ceil(finalTotal / 5) * 5,
    Math.ceil(finalTotal / 10) * 10,
    Math.ceil(finalTotal / 20) * 20
  ].filter((amount, index, arr) => arr.indexOf(amount) === index).sort((a, b) => a - b);

  const handleInitiatePayment = async () => {
    if (currentOrder.length === 0) {
      toast({
        title: 'Error',
        description: 'No items in order',
        variant: 'destructive'
      });
      return;
    }

    try {
      const paymentData: PaymentInitiateRequest = {
        paymentMethod: selectedPaymentMethod,
        totalAmount: finalTotal,
        notes: `Payment for ${currentOrder.length} items`
      };

      const response = await initiatePaymentMutation.mutateAsync({
        orderId: 1, // This should come from current order context
        paymentData
      });

      setCurrentPaymentId(response.paymentId);
      toast({
        title: 'Payment Initiated',
        description: `Ready to process ${selectedPaymentMethod} payment`,
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate payment',
        variant: 'destructive'
      });
    }
  };

  const handleValidatePayment = async () => {
    if (!currentPaymentId) {
      await handleInitiatePayment();
      return;
    }

    // Validate payment based on method
    if (selectedPaymentMethod === 'CASH' && cashValue < finalTotal) {
      toast({
        title: 'Insufficient Cash',
        description: `Need $${finalTotal.toFixed(2)}, received $${cashValue.toFixed(2)}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const validateData: PaymentValidateRequest = {
        paymentId: currentPaymentId,
        paymentMethod: selectedPaymentMethod,
        ...(selectedPaymentMethod === 'CASH' && { amountTendered: cashValue }),
        ...(tipAmount > 0 && { tipAmount }),
        notes: 'Payment validated via POS'
      };

      const response = await validatePaymentMutation.mutateAsync({
        orderId: 1, // This should come from current order context
        validateData
      });

      onPaymentSuccess(response);
      
      toast({
        title: 'Payment Successful',
        description: `Order ${response.orderNumber} completed`,
      });

      // Show change for cash payments
      if (selectedPaymentMethod === 'CASH' && change > 0) {
        setTimeout(() => {
          toast({
            title: 'Change Due',
            description: `Give customer $${change.toFixed(2)}`,
            variant: 'default'
          });
        }, 1000);
      }

    } catch (error) {
      console.error('Payment validation error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Please try again or use a different payment method',
        variant: 'destructive'
      });
    }
  };

  const isProcessing = initiatePaymentMutation.isPending || validatePaymentMutation.isPending;

  return (
    <div className="flex-shrink-0 border-t bg-gray-50">
      {/* Payment Header with Collapse Button */}
      <div className="p-4 border-b bg-orange-50 border-orange-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
        {onToggleCollapse && (
          <Button
            variant={isCollapsed ? 'default' : 'ghost'}
            size="sm"
            onClick={onToggleCollapse}
            className={isCollapsed 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }
            title={isCollapsed ? 'Expand payment interface (Ctrl+H)' : 'Collapse payment interface (Ctrl+H)'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Collapsed State Summary */}
      {isCollapsed && (
        <div className="p-4 bg-orange-50 border-b border-orange-200">
          <div className="text-center">
            <p className="text-sm text-orange-800 font-medium">
              Payment ready • Total: ${finalTotal.toFixed(2)}
            </p>
            <p className="text-xs text-orange-600">
              Click ↓ above to expand payment options
            </p>
          </div>
        </div>
      )}

      {/* Payment Interface - Collapsible */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}>
        <div className="p-4">
          {/* Pre-Payment Actions */}
          <div className="space-y-3 mb-4">
        {/* Customer */}
        <button
          onClick={onCustomerClick}
          className="w-full flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <User className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium">
              {selectedCustomer ? selectedCustomer.name : 'Customer'}
            </span>
          </div>
          {selectedCustomer && (
            <Badge variant="secondary" className="text-xs">
              Selected
            </Badge>
          )}
        </button>

        {/* Invoice */}
        <button
          disabled={!selectedCustomer}
          className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
            selectedCustomer 
              ? 'bg-white hover:bg-gray-50' 
              : 'bg-gray-100 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center">
            <FileText className={`h-5 w-5 mr-3 ${
              selectedCustomer ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              selectedCustomer ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Invoice
            </span>
          </div>
        </button>

        {/* Add Tip */}
        <button
          onClick={onTipClick}
          className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
            tipAmount > 0 
              ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium">
              {tipAmount > 0 ? `Tip: $${tipAmount.toFixed(2)}` : 'Add Tip'}
            </span>
          </div>
          {tipAmount > 0 && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              Added
            </Badge>
          )}
        </button>
      </div>

      <Separator className="my-4" />

      {/* Payment Methods */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Button
                key={method.id}
                variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`p-3 h-auto flex flex-col items-center ${
                  selectedPaymentMethod === method.id 
                    ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' 
                    : 'hover:border-orange-300'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{method.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Payment Details Area */}
      {selectedPaymentMethod === 'CASH' && (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Tendered
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              className="text-lg"
              step="0.01"
            />
          </div>
          
          {/* Quick Cash Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {quickCashAmounts.slice(0, 6).map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setCashTendered(amount.toFixed(2))}
                className="text-xs"
              >
                ${amount.toFixed(2)}
              </Button>
            ))}
          </div>

          {/* Change Calculation */}
          {cashValue > 0 && (
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex justify-between text-sm mb-1">
                <span>Cash Received:</span>
                <span>${cashValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Due:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Change:</span>
                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${change.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPaymentMethod === 'CARD' && (
        <div className="p-4 bg-blue-50 rounded-lg mb-4 text-center">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-blue-800">Insert, tap, or swipe card</p>
          <p className="text-xs text-blue-600 mt-1">Waiting for terminal...</p>
        </div>
      )}

      {selectedPaymentMethod === 'MOBILE_PAYMENT' && (
        <div className="p-4 bg-purple-50 rounded-lg mb-4 text-center">
          <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-purple-800">Present phone to terminal</p>
          <p className="text-xs text-purple-600 mt-1">Ready for mobile payment</p>
        </div>
      )}

      {selectedPaymentMethod === 'GIFT_CARD' && (
        <div className="space-y-3 mb-4">
          <Input
            placeholder="Gift card number"
            className="text-lg"
          />
          <Input
            placeholder="PIN (if required)"
            className="text-lg"
            type="password"
          />
        </div>
      )}

          {/* Validate Button */}
          <Button
            onClick={handleValidatePayment}
            disabled={isProcessing || (selectedPaymentMethod === 'CASH' && cashValue < finalTotal)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                VALIDATE PAYMENT - ${finalTotal.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}