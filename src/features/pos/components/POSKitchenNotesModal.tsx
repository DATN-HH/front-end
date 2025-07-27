'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface POSKitchenNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (notes: string[]) => void;
    currentNotes?: string[];
    itemName?: string;
}

// Default common kitchen notes
const DEFAULT_NOTES = [
    'Wait',
    'To Serve',
    'Emergency',
    'No Dressing',
    'Extra Sauce',
    'No Ice',
    'Extra Hot',
    'Mild Spice',
    'No Onions',
    'Extra Cheese',
    'Well Done',
    'Medium Rare',
];

// Get common notes from localStorage or use defaults
const getCommonNotes = (): string[] => {
    try {
        const saved = localStorage.getItem('pos-kitchen-notes');
        return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch (error) {
        console.error('Failed to load kitchen notes:', error);
        return DEFAULT_NOTES;
    }
};

export function POSKitchenNotesModal({
    isOpen,
    onClose,
    onApply,
    currentNotes = [],
    itemName,
}: POSKitchenNotesModalProps) {
    const [selectedNotes, setSelectedNotes] = useState<string[]>(currentNotes);
    const [customNote, setCustomNote] = useState('');
    const [commonNotes, setCommonNotes] = useState<string[]>(getCommonNotes());

    // Reset when modal opens and reload common notes
    useEffect(() => {
        if (isOpen) {
            setSelectedNotes(currentNotes);
            setCustomNote('');
            setCommonNotes(getCommonNotes()); // Reload in case settings changed
        }
    }, [isOpen, currentNotes]);

    const handleNoteToggle = (note: string) => {
        setSelectedNotes(prev => 
            prev.includes(note) 
                ? prev.filter(n => n !== note)
                : [...prev, note]
        );
    };

    const handleApply = () => {
        const allNotes = [...selectedNotes];
        if (customNote.trim()) {
            allNotes.push(customNote.trim());
        }
        onApply(allNotes);
        onClose();
    };

    const handleDiscard = () => {
        setSelectedNotes([]);
        setCustomNote('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Add Kitchen Note
                    </DialogTitle>
                    {itemName && (
                        <p className="text-sm text-gray-600">
                            Adding notes for: <span className="font-medium">{itemName}</span>
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-6">
                    {/* Common Notes */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Common Notes
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {commonNotes.map((note) => (
                                <Button
                                    key={note}
                                    variant={selectedNotes.includes(note) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleNoteToggle(note)}
                                    className="h-10 text-sm"
                                >
                                    {note}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Note */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Custom Note
                        </h3>
                        <Textarea
                            placeholder="Enter custom kitchen instructions..."
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Selected Notes Preview */}
                    {(selectedNotes.length > 0 || customNote.trim()) && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Selected Notes
                            </h3>
                            <Card className="p-3 bg-gray-50">
                                <div className="flex flex-wrap gap-2">
                                    {selectedNotes.map((note, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                                        >
                                            {note}
                                            <button
                                                onClick={() => handleNoteToggle(note)}
                                                className="hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {customNote.trim() && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                                            {customNote.trim()}
                                            <button
                                                onClick={() => setCustomNote('')}
                                                className="hover:bg-green-200 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleDiscard}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
