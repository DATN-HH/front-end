'use client';

import { Image as ImageIcon } from 'lucide-react';

import { FloorResponse } from '@/api/v1/floors';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ImageViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    floor: FloorResponse | null;
}

export function ImageViewDialog({
    isOpen,
    onClose,
    floor,
}: ImageViewDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg">
                        {floor?.name} - Floor Layout
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-center items-center min-h-[300px] max-h-[70vh]">
                    {floor?.imageUrl ? (
                        <div className="w-full h-full flex justify-center items-center overflow-hidden">
                            <img
                                src={floor.imageUrl}
                                alt={floor.name}
                                className="max-w-full max-h-full object-contain rounded-lg border shadow-sm"
                                style={{ maxHeight: '70vh' }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm sm:text-base">
                                    No image available
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm">
                                    Upload an image to see the floor layout
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
