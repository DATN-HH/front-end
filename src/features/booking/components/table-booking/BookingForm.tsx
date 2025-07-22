'use client';

import {
    Calendar,
    Users,
    User,
    Phone,
    Mail,
    MessageSquare,
    CreditCard,
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
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting?: boolean;
    mode?: 'guest' | 'admin';
}

export function BookingForm({
    bookingData,
    selectedTables,
    onBookingDataChange,
    onSubmit,
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

    // Handle form submission with validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate email requirement for banking
        if (isEmailRequired && !bookingData.customerEmail.trim()) {
            // Create a validation error by focusing the email field
            const emailField = document.getElementById(
                'customerEmail'
            ) as HTMLInputElement;
            if (emailField) {
                emailField.focus();
                emailField.setCustomValidity(
                    'Email is required for banking payment'
                );
                emailField.reportValidity();
            }
            return;
        }

        // Clear any previous validation errors
        const emailField = document.getElementById(
            'customerEmail'
        ) as HTMLInputElement;
        if (emailField) {
            emailField.setCustomValidity('');
        }

        // Call parent submit handler
        onSubmit(e);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Booking Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
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
                            Email Address{' '}
                            {isEmailRequired
                                ? '(Required for Banking)'
                                : '(Optional)'}
                        </Label>
                        <Input
                            id="customerEmail"
                            type="email"
                            placeholder="Enter email address"
                            value={bookingData.customerEmail}
                            onChange={(e) =>
                                onBookingDataChange({
                                    customerEmail: e.target.value,
                                })
                            }
                            required={isEmailRequired}
                        />
                        {isEmailRequired ? (
                            <p className="text-xs text-orange-600">
                                Email is required for banking payment
                                confirmations and receipts
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                For booking reminders and payment confirmations
                            </p>
                        )}
                    </div>

                    {/* Payment Type - Only for admin mode */}
                    {mode === 'admin' && (
                        <div className="space-y-1">
                            <Label
                                htmlFor="paymentType"
                                className="flex items-center gap-2 text-sm"
                            >
                                <CreditCard className="w-4 h-4" />
                                Payment Type
                            </Label>
                            <Select
                                value={bookingData.paymentType || 'cash'}
                                onValueChange={(value: 'cash' | 'banking') =>
                                    onBookingDataChange({ paymentType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="banking">
                                        Banking
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            !hasSelectedTables ||
                            isSubmitting ||
                            (isEmailRequired &&
                                !bookingData.customerEmail.trim())
                        }
                    >
                        {isSubmitting
                            ? 'Processing...'
                            : mode === 'admin'
                              ? 'Complete Booking'
                              : 'Book Now'}
                    </Button>

                    {!hasSelectedTables && (
                        <p className="text-sm text-muted-foreground text-center">
                            Please select at least one table to continue
                        </p>
                    )}

                    {isEmailRequired && !bookingData.customerEmail.trim() && (
                        <p className="text-sm text-orange-600 text-center">
                            Email is required for banking payment
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
