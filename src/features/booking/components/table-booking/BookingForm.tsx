'use client';

import {
    Calendar,
    Users,
    User,
    Phone,
    Mail,
    MessageSquare,
} from 'lucide-react';

import { TableResponse } from '@/api/v1/tables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface BookingData {
    guests: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string;
    paymentType?: 'cash' | 'banking';
}

interface BookingFormProps {
    bookingData: BookingData;
    selectedTables: TableResponse[];
    selectedDate: string;
    onBookingDataChange: (data: Partial<BookingData>) => void;
    isSubmitting?: boolean;
    mode?: 'guest' | 'admin';
}

export function BookingForm({
    bookingData,
    selectedTables,
    onBookingDataChange,
    isSubmitting = false,
    mode = 'guest',
}: BookingFormProps) {
    const maxCapacity = selectedTables.reduce(
        (sum, table) => sum + table.capacity,
        0
    );
    const hasSelectedTables = selectedTables.length > 0;

    // Check if email is required (when admin mode and banking payment)
    const isEmailRequired =
        mode === 'admin' && bookingData.paymentType === 'banking';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Booking Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label
                            htmlFor="guests"
                            className="flex items-center gap-2 text-sm"
                        >
                            <Users className="w-4 h-4" />
                            Number of Guests
                        </Label>
                        <Select
                            value={bookingData.guests.toString()}
                            onValueChange={(value) =>
                                onBookingDataChange({ guests: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from(
                                    { length: Math.max(1, maxCapacity) },
                                    (_, i) => i + 1
                                ).map((num) => (
                                    <SelectItem
                                        key={num}
                                        value={num.toString()}
                                    >
                                        {num} {num === 1 ? 'guest' : 'guests'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasSelectedTables && (
                            <p className="text-xs text-muted-foreground">
                                Maximum capacity: {maxCapacity} guests
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="customerName"
                            className="flex items-center gap-2 text-sm"
                        >
                            <User className="w-4 h-4" />
                            Customer Name
                        </Label>
                        <Input
                            id="customerName"
                            type="text"
                            placeholder="Enter customer name"
                            value={bookingData.customerName}
                            onChange={(e) =>
                                onBookingDataChange({
                                    customerName: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="customerPhone"
                            className="flex items-center gap-2 text-sm"
                        >
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </Label>
                        <Input
                            id="customerPhone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={bookingData.customerPhone}
                            onChange={(e) =>
                                onBookingDataChange({
                                    customerPhone: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="customerEmail"
                            className="flex items-center gap-2 text-sm"
                        >
                            <Mail className="w-4 h-4" />
                            Email Address
                        </Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            placeholder="Enter email address"
                            value={
                                bookingData.customerEmail || 'temp@gmail.com'
                            }
                            onChange={(e) =>
                                onBookingDataChange({
                                    customerEmail: e.target.value,
                                })
                            }
                            required={true}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="notes"
                            className="flex items-center gap-2 text-sm"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Special Notes (Optional)
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Any special requests or notes..."
                            value={bookingData.notes}
                            onChange={(e) =>
                                onBookingDataChange({ notes: e.target.value })
                            }
                            rows={3}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
