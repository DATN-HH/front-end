'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    MessageSquare,
    Star,
    Calendar,
    User,
    Building,
    Package,
    Reply,
    Eye,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from 'lucide-react';
import { FeedbackResponseDto } from '@/api/v1/feedback';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface FeedbackListProps {
    feedback: FeedbackResponseDto[];
    loading: boolean;
    pagination: {
        page: number;
        size: number;
        total: number;
    };
    onPaginationChange: (pagination: {
        page: number;
        size: number;
        total: number;
    }) => void;
    onRefresh: () => void;
}

export function FeedbackList({
    feedback,
    loading,
    pagination,
    onPaginationChange,
    onRefresh,
}: FeedbackListProps) {
    const [selectedFeedback, setSelectedFeedback] =
        useState<FeedbackResponseDto | null>(null);

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

    const getTypeIcon = (type: string) => {
        return type === 'RESTAURANT' ? Building : Package;
    };

    const totalPages = Math.ceil(pagination.total / pagination.size);

    const handlePageChange = (newPage: number) => {
        onPaginationChange({
            ...pagination,
            page: newPage,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Feedback List
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse border rounded-lg p-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Feedback List ({pagination.total} total)
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Showing {pagination.page * pagination.size + 1} -{' '}
                            {Math.min(
                                (pagination.page + 1) * pagination.size,
                                pagination.total
                            )}{' '}
                            of {pagination.total}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {feedback.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                No feedback found
                            </h3>
                            <p className="text-muted-foreground">
                                No feedback matches your current filters. Try
                                adjusting your search criteria.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedback.map((item) => {
                                const TypeIcon = getTypeIcon(item.feedbackType);
                                return (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() =>
                                            setSelectedFeedback(item)
                                        }
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    {item.customerName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Content */}
                                            <div className="flex-1 space-y-2">
                                                {/* Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-lg">
                                                                {item.title}
                                                            </h4>
                                                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {
                                                                    item.customerName
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Building className="h-3 w-3" />
                                                                {
                                                                    item.branchName
                                                                }
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(
                                                                    item.createdAt
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={
                                                                        i <
                                                                        item.overallRating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                        <span className="ml-1 text-sm font-medium">
                                                            {item.overallRating}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                {item.productName && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            Product:
                                                        </span>
                                                        <span className="font-medium">
                                                            {item.productName}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Review Text */}
                                                <p className="text-gray-700 line-clamp-2">
                                                    {item.reviewText}
                                                </p>

                                                {/* Response Preview */}
                                                {item.responseText && (
                                                    <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Reply className="h-3 w-3 text-blue-600" />
                                                            <span className="text-xs font-medium text-blue-800">
                                                                Response by{' '}
                                                                {
                                                                    item.respondedByName
                                                                }
                                                            </span>
                                                            <span className="text-xs text-blue-600">
                                                                {item.responseDate &&
                                                                    formatDate(
                                                                        item.responseDate
                                                                    )}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-blue-700 line-clamp-1">
                                                            {item.responseText}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        className={getStatusColor(
                                                            item.feedbackStatus
                                                        )}
                                                    >
                                                        {item.feedbackStatus}
                                                    </Badge>
                                                    <Badge
                                                        className={getPriorityColor(
                                                            item.priority
                                                        )}
                                                    >
                                                        {item.priority}
                                                    </Badge>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFeedback(
                                                            item
                                                        );
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Page {pagination.page + 1} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page - 1)
                                    }
                                    disabled={pagination.page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i;
                                            } else if (pagination.page < 3) {
                                                pageNum = i;
                                            } else if (
                                                pagination.page >
                                                totalPages - 4
                                            ) {
                                                pageNum = totalPages - 5 + i;
                                            } else {
                                                pageNum =
                                                    pagination.page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        pagination.page ===
                                                        pageNum
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum
                                                        )
                                                    }
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {pageNum + 1}
                                                </Button>
                                            );
                                        }
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page + 1)
                                    }
                                    disabled={pagination.page >= totalPages - 1}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Feedback Detail Modal */}
            {selectedFeedback && (
                <FeedbackDetailModal
                    feedback={selectedFeedback}
                    isOpen={!!selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                    onUpdate={onRefresh}
                />
            )}
        </>
    );
}

