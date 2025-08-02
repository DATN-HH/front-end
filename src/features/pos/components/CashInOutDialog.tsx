'use client';

import { DollarSign, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

import {
    useCurrentPOSSession,
    useCreateCashMovement,
    CashMovementType,
} from '@/api/v1/pos-sessions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCustomToast } from '@/lib/show-toast';

interface CashInOutDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CashInOutDialog({ isOpen, onClose }: CashInOutDialogProps) {
    const { success, error } = useCustomToast();
    const [activeTab, setActiveTab] = useState<'cash-in' | 'cash-out'>(
        'cash-in'
    );
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    // API hooks
    const { data: currentSession } = useCurrentPOSSession();
    const createCashMovementMutation = useCreateCashMovement();

    const handleSubmit = async () => {
        const amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            error('Error', 'Please enter a valid amount');
            return;
        }

        if (!reason.trim()) {
            error('Error', 'Please provide a reason for this transaction');
            return;
        }

        if (!currentSession) {
            error('Error', 'No active session found');
            return;
        }

        try {
            await createCashMovementMutation.mutateAsync({
                sessionId: currentSession.id,
                type:
                    activeTab === 'cash-in'
                        ? CashMovementType.CASH_IN
                        : CashMovementType.CASH_OUT,
                amount: amountValue,
                reason: reason.trim(),
            });

            success(
                'Success',
                `Cash ${activeTab === 'cash-in' ? 'added' : 'removed'} successfully`
            );

            // Reset form
            setAmount('');
            setReason('');
            onClose();
        } catch (err) {
            error('Error', 'Failed to process cash transaction');
        }
    };

    const handleClose = () => {
        setAmount('');
        setReason('');
        onClose();
    };

    const predefinedReasons = {
        'cash-in': [
            'Change fund',
            'Tip collection',
            'Petty cash',
            'Bank deposit return',
        ],
        'cash-out': [
            'Change for customer',
            'Petty cash expense',
            'Bank deposit',
            'Staff advance',
        ],
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Cash In/Out
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                        setActiveTab(value as 'cash-in' | 'cash-out')
                    }
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="cash-in"
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Cash In
                        </TabsTrigger>
                        <TabsTrigger
                            value="cash-out"
                            className="flex items-center gap-2"
                        >
                            <Minus className="w-4 h-4" />
                            Cash Out
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cash-in" className="space-y-4">
                        <div className="text-sm text-gray-600">
                            Add cash to the register
                        </div>

                        <div>
                            <Label htmlFor="amount-in">Amount (₫)</Label>
                            <Input
                                id="amount-in"
                                type="number"
                                placeholder="Enter amount to add"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="reason-in">Reason</Label>
                            <Textarea
                                id="reason-in"
                                placeholder="Reason for adding cash"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />

                            {/* Predefined reasons */}
                            <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">
                                    Quick reasons:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {predefinedReasons['cash-in'].map(
                                        (predefinedReason) => (
                                            <Button
                                                key={predefinedReason}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-6"
                                                onClick={() =>
                                                    setReason(predefinedReason)
                                                }
                                            >
                                                {predefinedReason}
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cash-out" className="space-y-4">
                        <div className="text-sm text-gray-600">
                            Remove cash from the register
                        </div>

                        <div>
                            <Label htmlFor="amount-out">Amount (₫)</Label>
                            <Input
                                id="amount-out"
                                type="number"
                                placeholder="Enter amount to remove"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="reason-out">Reason</Label>
                            <Textarea
                                id="reason-out"
                                placeholder="Reason for removing cash"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />

                            {/* Predefined reasons */}
                            <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">
                                    Quick reasons:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {predefinedReasons['cash-out'].map(
                                        (predefinedReason) => (
                                            <Button
                                                key={predefinedReason}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-6"
                                                onClick={() =>
                                                    setReason(predefinedReason)
                                                }
                                            >
                                                {predefinedReason}
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Current session info */}
                {currentSession && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="font-medium mb-1">Current Session</div>
                        <div className="flex justify-between">
                            <span>Expected Cash:</span>
                            <span>
                                {currentSession.expectedCash.toLocaleString()} ₫
                            </span>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createCashMovementMutation.isPending}
                        className="flex-1"
                    >
                        {createCashMovementMutation.isPending
                            ? 'Processing...'
                            : `${activeTab === 'cash-in' ? 'Add' : 'Remove'} Cash`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
