'use client';

import { User, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { useActiveStaff } from '@/api/v1/kds';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaffRole } from '@/types/kds';

interface StaffAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (staffId: number) => void;
    itemName?: string;
}

export function StaffAssignmentModal({
    isOpen,
    onClose,
    onAssign,
    itemName,
}: StaffAssignmentModalProps) {
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    const {
        data: kitchenStaff,
        isLoading,
        error,
    } = useActiveStaff(StaffRole.KITCHEN);

    const handleAssign = async () => {
        if (!selectedStaffId) return;

        setIsAssigning(true);
        try {
            await onAssign(selectedStaffId);
        } finally {
            setIsAssigning(false);
        }
    };

    const getInitials = (fullName: string): string => {
        return fullName
            .split(' ')
            .map((name) => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Select Kitchen Staff
                    </DialogTitle>
                    {itemName && (
                        <p className="text-sm text-gray-600">
                            Item:{' '}
                            <span className="font-medium">{itemName}</span>
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading staff list...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">
                            <p>Unable to load staff list</p>
                        </div>
                    ) : !kitchenStaff?.staff ||
                      kitchenStaff.staff.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No kitchen staff currently working</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-gray-600">
                                {kitchenStaff.totalStaff} kitchen staff
                                currently working
                            </div>
                            <ScrollArea className="max-h-64">
                                <div className="space-y-2">
                                    {kitchenStaff.staff.map((staff) => (
                                        <Card
                                            key={staff.staffId}
                                            className={`cursor-pointer transition-all hover:shadow-md ${
                                                selectedStaffId ===
                                                staff.staffId
                                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() =>
                                                setSelectedStaffId(
                                                    staff.staffId
                                                )
                                            }
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            {getInitials(
                                                                staff.fullName
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">
                                                            {staff.fullName}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            Shift:{' '}
                                                            {staff.shiftName} (
                                                            {
                                                                staff.shiftStartTime
                                                            }{' '}
                                                            -{' '}
                                                            {staff.shiftEndTime}
                                                            )
                                                        </p>
                                                    </div>
                                                    {selectedStaffId ===
                                                        staff.staffId && (
                                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isAssigning}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedStaffId || isAssigning}
                            className="flex-1"
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
