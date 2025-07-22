'use client';

import {
    Calendar,
    Clock,
    Users,
    User,
    Phone,
    Mail,
    MessageSquare,
    Timer,
} from 'lucide-react';
import { useState } from 'react';

import {
    CreateWaitlistRequest,
    validateWaitlistForm,
    useCreateWaitlist,
} from '@/api/v1/waitlist';
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
import { useCustomToast } from '@/lib/show-toast';

interface WaitlistFormProps {
    onSuccess?: (waitlistId: number) => void;
    onCancel?: () => void;
    initialData?: {
        guestCount?: number;
        customerName?: string;
        customerPhone?: string;
        customerEmail?: string;
        preferredStartTime?: string;
        duration?: number;
        branchId?: number;
    };
    compact?: boolean;
}

// Helper function to format Date to datetime-local string without timezone conversion
const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function WaitlistForm({
    onSuccess,
    onCancel,
    initialData = {},
    compact = false,
}: WaitlistFormProps) {
    const [formData, setFormData] = useState<Partial<CreateWaitlistRequest>>(
        () => {
            const initial: Partial<CreateWaitlistRequest> = {
                guestCount: 2,
                duration: 2,
                maxWaitHours: 3,
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                notes: '',
                preferredEndTime: '',
                branchId: 1, // Default branch ID
                ...initialData,
            };

            // Auto-calculate end time if start time and duration are provided
            if (initial.preferredStartTime && initial.duration) {
                const startDate = new Date(initial.preferredStartTime);
                const endDate = new Date(
                    startDate.getTime() + initial.duration * 60 * 60 * 1000
                );

                initial.preferredEndTime = formatDateTimeLocal(endDate);
            }

            return initial;
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { success, error } = useCustomToast();
    const createMutation = useCreateWaitlist();

    const handleInputChange = (
        field: keyof CreateWaitlistRequest,
        value: any
    ) => {
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }

        // Auto-calculate end time when start time or duration changes
        if (field === 'preferredStartTime' || field === 'duration') {
            setFormData((prev) => {
                const startTime =
                    field === 'preferredStartTime'
                        ? value
                        : prev.preferredStartTime;
                const duration = field === 'duration' ? value : prev.duration;

                let preferredEndTime = prev.preferredEndTime;
                if (startTime && duration) {
                    // Parse datetime-local value and add duration
                    const startDate = new Date(startTime);
                    const endDate = new Date(
                        startDate.getTime() + duration * 60 * 60 * 1000
                    );

                    preferredEndTime = formatDateTimeLocal(endDate);
                }

                return {
                    ...prev,
                    [field]: value,
                    preferredEndTime,
                };
            });
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateWaitlistForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            error('Validation Error', 'Please check the information');
            return;
        }

        try {
            const response = await createMutation.mutateAsync(
                formData as CreateWaitlistRequest
            );

            if (response.success && response.payload) {
                success(
                    'Success',
                    response.message || 'Waitlist created successfully'
                );
                onSuccess?.(response.payload.waitlistId);
            }
        } catch (err: any) {
            console.error('Waitlist creation error:', err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'An error occurred';
            error('Error', errorMessage);
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
        return now.toISOString().slice(0, 16);
    };

    const CardWrapper = compact ? 'div' : Card;
    const HeaderWrapper = compact ? 'div' : CardHeader;
    const ContentWrapper = compact ? 'div' : CardContent;

    return (
        <CardWrapper className={!compact ? 'w-full' : ''}>
            <HeaderWrapper className={compact ? 'mb-4' : ''}>
                <CardTitle
                    className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-base'}`}
                >
                    <Timer className="w-5 h-5 text-orange-500" />
                    Join Waitlist
                </CardTitle>
                {!compact && (
                    <p className="text-sm text-muted-foreground">
                        No tables are currently available. Join our waitlist and
                        we'll notify you as soon as a table becomes available.
                    </p>
                )}
            </HeaderWrapper>
            <ContentWrapper>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4" />
                                Preferred Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={
                                    formData.preferredStartTime
                                        ? formData.preferredStartTime.slice(
                                              0,
                                              16
                                          )
                                        : ''
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        'preferredStartTime',
                                        e.target.value
                                    )
                                }
                                min={getMinDateTime()}
                                required
                            />
                            {errors.preferredStartTime && (
                                <p className="text-sm text-red-600">
                                    {errors.preferredStartTime}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                Duration
                            </Label>
                            <Select
                                value={formData.duration?.toString()}
                                onValueChange={(value) =>
                                    handleInputChange(
                                        'duration',
                                        parseInt(value)
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(
                                        { length: 6 },
                                        (_, i) => i + 1
                                    ).map((hours) => (
                                        <SelectItem
                                            key={hours}
                                            value={hours.toString()}
                                        >
                                            {hours}{' '}
                                            {hours === 1 ? 'hour' : 'hours'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.duration && (
                                <p className="text-sm text-red-600">
                                    {errors.duration}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Guest Count & Wait Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4" />
                                Guest Count
                            </Label>
                            <Select
                                value={formData.guestCount?.toString()}
                                onValueChange={(value) =>
                                    handleInputChange(
                                        'guestCount',
                                        parseInt(value)
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(
                                        { length: 20 },
                                        (_, i) => i + 1
                                    ).map((num) => (
                                        <SelectItem
                                            key={num}
                                            value={num.toString()}
                                        >
                                            {num}{' '}
                                            {num === 1 ? 'guest' : 'guests'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.guestCount && (
                                <p className="text-sm text-red-600">
                                    {errors.guestCount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Timer className="w-4 h-4" />
                                Max Wait Time
                            </Label>
                            <Select
                                value={formData.maxWaitHours?.toString()}
                                onValueChange={(value) =>
                                    handleInputChange(
                                        'maxWaitHours',
                                        parseInt(value)
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(
                                        { length: 24 },
                                        (_, i) => i + 1
                                    ).map((hours) => (
                                        <SelectItem
                                            key={hours}
                                            value={hours.toString()}
                                        >
                                            {hours}{' '}
                                            {hours === 1 ? 'hour' : 'hours'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.maxWaitHours && (
                                <p className="text-sm text-red-600">
                                    {errors.maxWaitHours}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4" />
                                Customer Name
                            </Label>
                            <Input
                                placeholder="Enter customer name"
                                value={formData.customerName}
                                onChange={(e) =>
                                    handleInputChange(
                                        'customerName',
                                        e.target.value
                                    )
                                }
                                required
                            />
                            {errors.customerName && (
                                <p className="text-sm text-red-600">
                                    {errors.customerName}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </Label>
                            <Input
                                type="tel"
                                placeholder="Enter phone number"
                                value={formData.customerPhone}
                                onChange={(e) =>
                                    handleInputChange(
                                        'customerPhone',
                                        e.target.value
                                    )
                                }
                                required
                            />
                            {errors.customerPhone && (
                                <p className="text-sm text-red-600">
                                    {errors.customerPhone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4" />
                            Email
                        </Label>
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={formData.customerEmail}
                            onChange={(e) =>
                                handleInputChange(
                                    'customerEmail',
                                    e.target.value
                                )
                            }
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Email will be used to notify you when a table
                            becomes available
                        </p>
                        {errors.customerEmail && (
                            <p className="text-sm text-red-600">
                                {errors.customerEmail}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Notes (Optional)
                        </Label>
                        <Textarea
                            placeholder="Special requests or notes..."
                            value={formData.notes}
                            onChange={(e) =>
                                handleInputChange('notes', e.target.value)
                            }
                            rows={2}
                            maxLength={500}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-600">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending
                                ? 'Processing...'
                                : 'Join Waitlist'}
                        </Button>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </ContentWrapper>
        </CardWrapper>
    );
}
