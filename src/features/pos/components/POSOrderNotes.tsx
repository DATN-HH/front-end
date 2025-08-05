'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface POSOrderNotesProps {
    isOpen: boolean;
    onClose: () => void;
    notes: string;
    onSave: (notes: string) => void;
    disabled?: boolean;
}

export function POSOrderNotes({
    isOpen,
    onClose,
    notes,
    onSave,
    disabled = false,
}: POSOrderNotesProps) {
    const [localNotes, setLocalNotes] = useState(notes);

    useEffect(() => {
        setLocalNotes(notes);
    }, [notes, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order Notes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Textarea
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder="Enter notes for this order..."
                        className="min-h-[200px]"
                        disabled={disabled}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={disabled}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                onSave(localNotes);
                                onClose();
                            }}
                            disabled={disabled}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
