'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface POSKitchenNotesSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

// Default common notes
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

export function POSKitchenNotesSettings({
    isOpen,
    onClose,
}: POSKitchenNotesSettingsProps) {
    const [notes, setNotes] = useState<string[]>(DEFAULT_NOTES);
    const [newNote, setNewNote] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Load saved notes from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('pos-kitchen-notes');
        if (savedNotes) {
            try {
                const parsed = JSON.parse(savedNotes);
                setNotes(parsed);
            } catch (error) {
                console.error('Failed to parse saved notes:', error);
            }
        }
    }, []);

    // Track changes
    useEffect(() => {
        const savedNotes = localStorage.getItem('pos-kitchen-notes');
        const currentNotes = JSON.stringify(notes);
        const originalNotes = savedNotes || JSON.stringify(DEFAULT_NOTES);
        setHasChanges(currentNotes !== originalNotes);
    }, [notes]);

    const handleAddNote = () => {
        if (newNote.trim() && !notes.includes(newNote.trim())) {
            setNotes(prev => [...prev, newNote.trim()]);
            setNewNote('');
        }
    };

    const handleRemoveNote = (index: number) => {
        setNotes(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        localStorage.setItem('pos-kitchen-notes', JSON.stringify(notes));
        setHasChanges(false);
    };

    const handleReset = () => {
        setNotes(DEFAULT_NOTES);
        localStorage.removeItem('pos-kitchen-notes');
        setHasChanges(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddNote();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Kitchen Notes Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Add New Note */}
                    <Card className="p-4">
                        <Label className="text-sm font-medium text-gray-900 mb-3 block">
                            Add New Note
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter new kitchen note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleAddNote}
                                disabled={!newNote.trim() || notes.includes(newNote.trim())}
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>
                    </Card>

                    {/* Current Notes */}
                    <Card className="p-4">
                        <Label className="text-sm font-medium text-gray-900 mb-3 block">
                            Current Notes ({notes.length})
                        </Label>
                        
                        {notes.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">
                                No notes configured. Add some notes above.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {notes.map((note, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                    >
                                        <span className="text-sm text-gray-900">
                                            {note}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveNote(index)}
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Preview */}
                    <Card className="p-4 bg-blue-50">
                        <Label className="text-sm font-medium text-blue-900 mb-3 block">
                            Preview - How notes will appear in the kitchen notes modal
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {notes.slice(0, 12).map((note, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-10 text-sm pointer-events-none"
                                >
                                    {note}
                                </Button>
                            ))}
                            {notes.length > 12 && (
                                <div className="text-xs text-blue-600 col-span-3 text-center mt-2">
                                    ... and {notes.length - 12} more
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="text-gray-600"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset to Default
                    </Button>
                    
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
