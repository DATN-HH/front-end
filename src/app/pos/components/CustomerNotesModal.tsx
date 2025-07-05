'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePosStore } from '@/stores/pos-store';
import { FileText, Save } from 'lucide-react';

export function CustomerNotesModal() {
    const { 
        showNotesModal, 
        closeNotesModal, 
        customerNotes, 
        specialInstructions,
        setCustomerNotes,
        setSpecialInstructions
    } = usePosStore();
    
    const [localCustomerNotes, setLocalCustomerNotes] = useState('');
    const [localSpecialInstructions, setLocalSpecialInstructions] = useState('');

    // Sync with store state when modal opens
    useEffect(() => {
        if (showNotesModal) {
            setLocalCustomerNotes(customerNotes);
            setLocalSpecialInstructions(specialInstructions);
        }
    }, [showNotesModal, customerNotes, specialInstructions]);

    const handleSave = () => {
        setCustomerNotes(localCustomerNotes);
        setSpecialInstructions(localSpecialInstructions);
        closeNotesModal();
    };

    const handleCancel = () => {
        // Reset to original values
        setLocalCustomerNotes(customerNotes);
        setLocalSpecialInstructions(specialInstructions);
        closeNotesModal();
    };

    return (
        <Dialog open={showNotesModal} onOpenChange={closeNotesModal}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-orange-600" />
                        Order Notes
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Customer Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Notes
                        </label>
                        <Textarea
                            placeholder="Add notes for the customer (e.g., table number, special requests)..."
                            value={localCustomerNotes}
                            onChange={(e) => setLocalCustomerNotes(e.target.value)}
                            className="min-h-[80px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {localCustomerNotes.length}/500 characters
                        </p>
                    </div>

                    {/* Special Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kitchen Instructions
                        </label>
                        <Textarea
                            placeholder="Special instructions for the kitchen (e.g., no onions, extra sauce, allergies)..."
                            value={localSpecialInstructions}
                            onChange={(e) => setLocalSpecialInstructions(e.target.value)}
                            className="min-h-[80px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {localSpecialInstructions.length}/500 characters
                        </p>
                    </div>

                    {/* Common Notes Templates */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Templates
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalSpecialInstructions(prev => 
                                    prev ? `${prev}, No onions` : 'No onions'
                                )}
                            >
                                No Onions
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalSpecialInstructions(prev => 
                                    prev ? `${prev}, Extra sauce` : 'Extra sauce'
                                )}
                            >
                                Extra Sauce
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalSpecialInstructions(prev => 
                                    prev ? `${prev}, Allergies: Nuts` : 'Allergies: Nuts'
                                )}
                            >
                                Nut Allergy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalSpecialInstructions(prev => 
                                    prev ? `${prev}, Cook well done` : 'Cook well done'
                                )}
                            >
                                Well Done
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalCustomerNotes(prev => 
                                    prev ? `${prev}, Takeaway order` : 'Takeaway order'
                                )}
                            >
                                Takeaway
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalCustomerNotes(prev => 
                                    prev ? `${prev}, Rush order` : 'Rush order'
                                )}
                            >
                                Rush Order
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Notes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}