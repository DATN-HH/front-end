'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
    Star,
    MessageSquare,
    Plus,
    Send,
    Calendar,
    MapPin,
    User,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { RestaurantFeedbackForm } from '@/features/feedback/components/RestaurantFeedbackForm';
import { ProductFeedbackForm } from '@/features/feedback/components/ProductFeedbackForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { managerFeedbackAPI } from '@/api/v1/feedback';
import { useBranches } from '@/api/v1/branches';
import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { useQuery } from '@tanstack/react-query';
import { useCustomToast } from '@/lib/show-toast';
import { format } from 'date-fns';

interface Review {
    id: number;
    customerName: string;
    overallRating: number;
    reviewText?: string;
    title: string;
    createdAt: string;
    branchName?: string;
    productName?: string;
    feedbackType: 'RESTAURANT' | 'PRODUCT';
    feedbackStatus: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CLOSED';
    responseText?: string;
    responseDate?: string;
    respondedBy?: number;
    images?: string[];
    categoryRatings?: Record<string, number>;
}

const StarRating = ({
    rating,
    size = 16,
}: {
    rating: number;
    size?: number;
}) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
            <span className="ml-1 text-sm text-gray-600">
                {rating.toFixed(1)}
            </span>
        </div>
    );
};

const StarRatingOnly = ({
    rating,
    size = 16,
}: {
    rating: number;
    size?: number;
}) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
};

const ReviewCard = ({
    review,
    onResponse,
}: {
    review: Review;
    onResponse: (reviewId: number, response: string) => void;
}) => {
    const [isResponding, setIsResponding] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitResponse = async () => {
        if (!responseText.trim()) return;

        setIsSubmitting(true);
        try {
            await onResponse(review.id, responseText);
            setResponseText('');
            setIsResponding(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            {review.customerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    {review.customerName}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar size={14} />
                                    {format(
                                        new Date(review.createdAt),
                                        'MMM dd, yyyy'
                                    )}
                                    {review.branchName && (
                                        <>
                                            <MapPin size={14} />
                                            {review.branchName}
                                        </>
                                    )}
                                    {review.productName && (
                                        <>
                                            <span>•</span>
                                            {review.productName}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={
                                        review.feedbackStatus === 'RESPONDED'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {review.feedbackStatus}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={
                                        review.feedbackType === 'RESTAURANT'
                                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                                            : 'border-green-200 text-green-700 bg-green-50'
                                    }
                                >
                                    {review.feedbackType === 'RESTAURANT'
                                        ? '🏪 Restaurant'
                                        : '🍽️ Product'}
                                </Badge>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-3">
                            <StarRating
                                rating={review.overallRating}
                                size={18}
                            />
                        </div>

                        {/* Title */}
                        {review.title && (
                            <h5 className="font-medium text-gray-900 mb-2">
                                {review.title}
                            </h5>
                        )}

                        {/* Review Text */}
                        {review.reviewText && (
                            <p className="text-gray-700 mb-3">
                                {review.reviewText}
                            </p>
                        )}

                        {/* Category Ratings */}
                        {review.categoryRatings &&
                            Object.keys(review.categoryRatings).length > 0 && (
                                <div className="mb-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(
                                            review.categoryRatings
                                        ).map(([category, rating]) => (
                                            <div
                                                key={category}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-gray-600">
                                                    {category.replace('_', ' ')}
                                                </span>
                                                <StarRatingOnly
                                                    rating={rating}
                                                    size={14}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Images - Google Maps Style */}
                        {review.images && review.images.length > 0 && (
                            <div className="mb-3">
                                <div className="flex gap-2">
                                    {review.images
                                        .slice(0, 3)
                                        .map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Review image ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    {review.images.length > 3 && (
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                            <span className="text-sm font-medium text-gray-600">
                                                +{review.images.length - 3}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Management Response */}
                        {review.responseText && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={16} className="text-blue-600" />
                                    <span className="font-medium text-blue-900">
                                        Management Response
                                    </span>
                                    {review.responseDate && (
                                        <span className="text-sm text-blue-600">
                                            •{' '}
                                            {format(
                                                new Date(review.responseDate),
                                                'MMM dd, yyyy'
                                            )}
                                        </span>
                                    )}
                                </div>
                                <p className="text-blue-800">
                                    {review.responseText}
                                </p>
                            </div>
                        )}

                        {/* Response Form */}
                        {!review.responseText && (
                            <div className="mt-4">
                                {!isResponding ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsResponding(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <MessageSquare size={16} />
                                        Respond
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Write a response to this review..."
                                            value={responseText}
                                            onChange={(e) =>
                                                setResponseText(e.target.value)
                                            }
                                            className="min-h-[80px]"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSubmitResponse}
                                                disabled={
                                                    !responseText.trim() ||
                                                    isSubmitting
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Send size={16} />
                                                {isSubmitting
                                                    ? 'Sending...'
                                                    : 'Send Response'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsResponding(false);
                                                    setResponseText('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function FeedbackPage() {
    const toast = useCustomToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('restaurant');

    // Fetch data
    const { data: branches = [] } = useBranches();
    const { data: foodCombosData = [] } = useAllFoodCombos();

    // Transform food combos to match expected interface
    const products = (foodCombosData || []).map((combo) => ({
        id: combo.id,
        name: combo.name,
        category: combo.categoryName || 'Food Combo',
    }));

    const { data: reviews = [], refetch } = useQuery({
        queryKey: ['feedback', 'all'],
        queryFn: async () => {
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 50,
                });
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                return [];
            }
        },
    });

    const handleResponse = async (reviewId: number, responseText: string) => {
        try {
            await managerFeedbackAPI.respondToFeedback(reviewId, {
                responseText,
            });
            toast.success('Success', 'Response sent successfully!');
            refetch();
        } catch (error: any) {
            console.error('Failed to send response:', error);
            toast.error(
                'Error',
                error.response?.data?.message || 'Failed to send response'
            );
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        refetch();
        toast.success('Success', 'Thank you for your feedback!');
    };

    // Calculate average rating
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.overallRating, 0) /
              reviews.length
            : 0;

    const totalReviews = reviews.length;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Customer Reviews
                            </h1>
                            <p className="text-gray-600 mt-1">
                                See what our customers are saying about us
                            </p>
                        </div>

                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus size={20} />
                                    Write a Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Write a Review</DialogTitle>
                                    <DialogDescription>
                                        Share your experience with us. Your
                                        feedback helps us improve our service.
                                    </DialogDescription>
                                </DialogHeader>

                                <Tabs
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="restaurant">
                                            Restaurant Review
                                        </TabsTrigger>
                                        <TabsTrigger value="product">
                                            Product Review
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="restaurant"
                                        className="mt-4"
                                    >
                                        <RestaurantFeedbackForm
                                            branches={branches}
                                            onSuccess={handleFormSuccess}
                                            onCancel={() =>
                                                setIsFormOpen(false)
                                            }
                                        />
                                    </TabsContent>

                                    <TabsContent
                                        value="product"
                                        className="mt-4"
                                    >
                                        <ProductFeedbackForm
                                            branches={branches}
                                            products={products}
                                            onSuccess={handleFormSuccess}
                                            onCancel={() =>
                                                setIsFormOpen(false)
                                            }
                                        />
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-lg border p-6 mb-6">
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                    {averageRating.toFixed(1)}
                                </div>
                                <StarRating rating={averageRating} size={20} />
                                <div className="text-sm text-gray-500 mt-1">
                                    Overall Rating
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                    {totalReviews}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Total Reviews
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div>
                    {reviews.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No reviews yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Be the first to share your experience with
                                    us!
                                </p>
                                <Button onClick={() => setIsFormOpen(true)}>
                                    Write the First Review
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div>
                            {(reviews || []).map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onResponse={handleResponse}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
