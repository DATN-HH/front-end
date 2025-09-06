'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Star,
    User,
    Building,
    Package,
    Calendar,
    Reply,
    Save,
    AlertTriangle,
} from 'lucide-react';
import { FeedbackResponseDto, managerFeedbackAPI } from '@/api/v1/feedback';
import { useCustomToast } from '@/lib/show-toast';

interface FeedbackDetailModalProps {
    feedback: FeedbackResponseDto;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function FeedbackDetailModal({
    feedback,
    isOpen,
    onClose,
    onUpdate,
}: FeedbackDetailModalProps) {
    const toast = useCustomToast();
    const [isResponding, setIsResponding] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [internalNotes, setInternalNotes] = useState(
        feedback.internalNotes || ''
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRespond = async () => {
        if (!responseText.trim()) {
            toast.error('Error', 'Please enter a response');
            return;
        }

        setIsUpdating(true);
        try {
            await managerFeedbackAPI.respondToFeedback(feedback.id, {
                responseText: responseText.trim(),
                internalNotes: internalNotes.trim(),
                markAsResolved: false,
            });

            toast.success('Success', 'Response sent successfully');
            setResponseText('');
            setIsResponding(false);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to respond to feedback:', error);
            toast.error('Error', 'Failed to send response');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await managerFeedbackAPI.updateFeedbackStatus(
                feedback.id,
                newStatus
            );
            toast.success('Success', 'Status updated successfully');
            onUpdate();
        } catch (error: any) {
            console.error('Failed to update status:', error);
            toast.error('Error', 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePriorityChange = async (newPriority: string) => {
        setIsUpdating(true);
        try {
            await managerFeedbackAPI.updateFeedbackPriority(
                feedback.id,
                newPriority
            );
            toast.success('Success', 'Priority updated successfully');
            onUpdate();
        } catch (error: any) {
            console.error('Failed to update priority:', error);
            toast.error('Error', 'Failed to update priority');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'RESPONDED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RESOLVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CLOSED':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'HIGH':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'URGENT':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            {feedback.feedbackType === 'RESTAURANT' ? (
                                <Building className="h-5 w-5" />
                            ) : (
                                <Package className="h-5 w-5" />
                            )}
                            {feedback.title}
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Feedback #{feedback.id} •{' '}
                        {feedback.feedbackType === 'RESTAURANT'
                            ? 'Restaurant'
                            : 'Product'}{' '}
                        Feedback
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer & Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        {feedback.customerName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">
                                        {feedback.customerName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {feedback.customerEmail}
                                    </p>
                                    {feedback.customerPhone && (
                                        <p className="text-sm text-muted-foreground">
                                            {feedback.customerPhone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>Branch: {feedback.branchName}</span>
                                </div>
                                {feedback.productName && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            Product: {feedback.productName}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Submitted:{' '}
                                        {new Date(
                                            feedback.createdAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                {feedback.orderId && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>
                                            Order ID: #{feedback.orderId}
                                        </span>
                                        {feedback.orderType && (
                                            <Badge variant="outline">
                                                {feedback.orderType}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Rating */}
                            <div>
                                <Label className="text-sm font-medium">
                                    Overall Rating
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={20}
                                                className={
                                                    i < feedback.overallRating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="font-medium">
                                        {feedback.overallRating}/5
                                    </span>
                                </div>
                            </div>

                            {/* Status & Priority Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Status
                                    </Label>
                                    <Select
                                        value={feedback.feedbackStatus}
                                        onValueChange={handleStatusChange}
                                        disabled={isUpdating}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="RESPONDED">
                                                Responded
                                            </SelectItem>
                                            <SelectItem value="RESOLVED">
                                                Resolved
                                            </SelectItem>
                                            <SelectItem value="CLOSED">
                                                Closed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Priority
                                    </Label>
                                    <Select
                                        value={feedback.priority}
                                        onValueChange={handlePriorityChange}
                                        disabled={isUpdating}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="MEDIUM">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="HIGH">
                                                High
                                            </SelectItem>
                                            <SelectItem value="URGENT">
                                                Urgent
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Current Status Badges */}
                            <div className="flex gap-2">
                                <Badge
                                    className={getStatusColor(
                                        feedback.feedbackStatus
                                    )}
                                >
                                    {feedback.feedbackStatus}
                                </Badge>
                                <Badge
                                    className={getPriorityColor(
                                        feedback.priority
                                    )}
                                >
                                    {feedback.priority}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Ratings */}
                    {feedback.categoryRatings &&
                        Object.keys(feedback.categoryRatings).length > 0 && (
                            <div>
                                <Label className="text-sm font-medium">
                                    Detailed Ratings
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {Object.entries(
                                        feedback.categoryRatings
                                    ).map(([category, rating]) => (
                                        <div
                                            key={category}
                                            className="flex items-center justify-between p-2 border rounded"
                                        >
                                            <span className="text-sm">
                                                {category.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={
                                                            i < rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Review Text */}
                    <div>
                        <Label className="text-sm font-medium">
                            Customer Review
                        </Label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm">{feedback.reviewText}</p>
                        </div>
                    </div>

                    {/* Images */}
                    {feedback.images && feedback.images.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium">
                                Attached Images
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                {feedback.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Feedback image ${index + 1}`}
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Response */}
                    {feedback.responseText && (
                        <div>
                            <Label className="text-sm font-medium">
                                Current Response
                            </Label>
                            <div className="mt-2 p-4 bg-blue-50 border-l-4 border-blue-200 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <Reply className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">
                                        Response by {feedback.respondedByName}
                                    </span>
                                    <span className="text-sm text-blue-600">
                                        {feedback.responseDate &&
                                            new Date(
                                                feedback.responseDate
                                            ).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700">
                                    {feedback.responseText}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Internal Notes */}
                    <div>
                        <Label className="text-sm font-medium">
                            Internal Notes
                        </Label>
                        <Textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Add internal notes (not visible to customer)..."
                            className="mt-2"
                            rows={3}
                        />
                    </div>

                    {/* Response Section */}
                    {!isResponding && !feedback.responseText && (
                        <Button
                            onClick={() => setIsResponding(true)}
                            className="w-full"
                            variant="outline"
                        >
                            <Reply className="h-4 w-4 mr-2" />
                            Respond to Customer
                        </Button>
                    )}

                    {isResponding && (
                        <div className="space-y-4 border-t pt-4">
                            <Label className="text-sm font-medium">
                                Your Response
                            </Label>
                            <Textarea
                                value={responseText}
                                onChange={(e) =>
                                    setResponseText(e.target.value)
                                }
                                placeholder="Write your response to the customer..."
                                rows={4}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleRespond}
                                    disabled={
                                        isUpdating || !responseText.trim()
                                    }
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isUpdating
                                        ? 'Sending...'
                                        : 'Send Response'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsResponding(false);
                                        setResponseText('');
                                    }}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
