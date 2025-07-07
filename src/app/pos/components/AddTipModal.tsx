'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';
import { useToast } from '@/hooks/use-toast';
import { useAddTip, useRemoveTip, TipCreateRequest } from '@/api/v1/pos/payments';

interface AddTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipApplied: (tipAmount: number) => void;
  currentTipAmount?: number;
}

export function AddTipModal({ isOpen, onClose, onTipApplied, currentTipAmount = 0 }: AddTipModalProps) {
  const { toast } = useToast();
  const { getSubtotal, getTax, orderId } = usePosStore();

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [noTip, setNoTip] = useState(false);

  const addTipMutation = useAddTip();
  const removeTipMutation = useRemoveTip();

  const subtotal = getSubtotal();
  const tax = getTax();
  const orderTotal = subtotal + tax;

  // Preset tip percentages
  const tipPercentages = [15, 20, 25];

  // Calculate tip amounts for each percentage
  const calculateTipAmount = (percentage: number) => {
    return (subtotal * percentage) / 100;
  };

  // Calculate current display values
  const getCurrentTipAmount = () => {
    if (noTip) return 0;
    if (selectedPercentage !== null) return calculateTipAmount(selectedPercentage);
    if (customAmount) return parseFloat(customAmount) || 0;
    return currentTipAmount;
  };

  const getCurrentTotal = () => {
    return orderTotal + getCurrentTipAmount();
  };

  // Handle percentage selection
  const handlePercentageClick = (percentage: number) => {
    setSelectedPercentage(percentage);
    setCustomAmount('');
    setNoTip(false);
  };

  // Handle no tip selection
  const handleNoTipClick = () => {
    setNoTip(true);
    setSelectedPercentage(null);
    setCustomAmount('');
  };

  // Handle custom amount input
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPercentage(null);
    setNoTip(false);
  };

  // Handle back button - reset and close
  const handleBack = () => {
    setSelectedPercentage(null);
    setCustomAmount('');
    setNoTip(false);
    onClose();
  };

  // Handle apply tip
  const handleApplyTip = async () => {
    try {
      const tipAmount = getCurrentTipAmount();

      if (tipAmount === 0) {
        // Remove tip
        if (orderId) {
          await removeTipMutation.mutateAsync(orderId);
        }
        onTipApplied(0);
      } else {
        // Add/update tip
        const tipData: TipCreateRequest = {
          subtotalAmount: subtotal,
          ...(selectedPercentage !== null 
            ? { percentage: selectedPercentage }
            : { customAmount: tipAmount }
          )
        };

        if (orderId) {
          await addTipMutation.mutateAsync({
            orderId,
            tipData,
          });
        }

        onTipApplied(tipAmount);
      }

      toast({
        title: 'Tip Updated',
        description: tipAmount > 0 
          ? `Tip of $${tipAmount.toFixed(2)} added to order`
          : 'Tip removed from order',
      });

      onClose();
    } catch (error) {
      console.error('Error updating tip:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tip. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Initialize state with current tip if exists
  useEffect(() => {
    if (isOpen && currentTipAmount > 0) {
      // Try to match current tip to a percentage
      const matchingPercentage = tipPercentages.find(
        percentage => Math.abs(calculateTipAmount(percentage) - currentTipAmount) < 0.01
      );
      
      if (matchingPercentage) {
        setSelectedPercentage(matchingPercentage);
      } else {
        setCustomAmount(currentTipAmount.toFixed(2));
      }
    }
  }, [isOpen, currentTipAmount, subtotal]);

  const isLoading = addTipMutation.isPending || removeTipMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 text-orange-600" />
          </Button>
          
          <DialogTitle className="text-lg font-semibold">Add a Tip</DialogTitle>
          
          <Button
            onClick={handleApplyTip}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2"
          >
            {isLoading ? 'Applying...' : 'Apply Tip'}
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-lg">
              <span className="font-medium">${subtotal.toFixed(2)}</span>
              {' + '}
              <span className="text-orange-600 font-medium">${getCurrentTipAmount().toFixed(2)} tip</span>
              {' = '}
              <span className="font-bold text-orange-600">${getCurrentTotal().toFixed(2)}</span>
            </p>
          </div>

          {/* Preset Tip Percentage Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {tipPercentages.map((percentage) => {
              const tipAmount = calculateTipAmount(percentage);
              const isSelected = selectedPercentage === percentage;
              
              return (
                <Button
                  key={percentage}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handlePercentageClick(percentage)}
                  className={`p-4 h-auto flex flex-col items-center ${
                    isSelected 
                      ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' 
                      : 'hover:border-orange-300'
                  }`}
                >
                  <span className={`text-2xl font-bold ${
                    isSelected ? 'text-white' : 'text-orange-600'
                  }`}>
                    {percentage}%
                  </span>
                  <span className={`text-sm ${
                    isSelected ? 'text-orange-100' : 'text-gray-600'
                  }`}>
                    ${tipAmount.toFixed(2)}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* No Tip Button */}
          <Button
            variant={noTip ? 'default' : 'outline'}
            onClick={handleNoTipClick}
            className={`w-full h-12 ${
              noTip 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'hover:border-gray-400'
            }`}
          >
            No Tip
          </Button>

          {/* Custom Tip Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-orange-600">
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className={`pl-8 text-lg h-12 ${
                  customAmount 
                    ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500' 
                    : ''
                }`}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}