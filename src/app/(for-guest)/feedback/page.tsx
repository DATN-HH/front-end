'use client';

import React, { useState, useEffect } from 'react';
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
    ChevronLeft,
    ChevronRight,
    Filter,
    SortAsc,
    SortDesc,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomToast } from '@/lib/show-toast';
import { format, isThisYear, isThisMonth, startOfYear, startOfMonth } from 'date-fns';
import { managerFeedbackAPI } from '@/api/v1/feedback';
import { useBranches } from '@/api/v1/branches';
import { useAllProducts } from '@/api/v1/menu/products';

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
    respondedByName?: string;
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
                                {/* Remove status badge for customers */}
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

                        {/* Images */}
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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Fetch branches using API
    const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useBranches({
        page: 0,
        size: 1000,
        sortBy: 'name',
        status: 'ACTIVE'
    });
    
    // Fetch products using API
    const { data: productsData, isLoading: productsLoading, error: productsError } = useAllProducts();
    
    // Filters and sorting
    const [filters, setFilters] = useState({
        starRating: 'ALL',
        dateSort: 'NEWEST',
        timeFilter: 'ALL'
    });
    
    // Filter and sort reviews
    const filteredAndSortedReviews = reviews
        .filter(review => {
            // Star rating filter
            if (filters.starRating !== 'ALL') {
                const targetRating = parseInt(filters.starRating);
                if (review.overallRating !== targetRating) {
                    return false;
                }
            }
            
            // Time filter
            const reviewDate = new Date(review.createdAt);
            if (filters.timeFilter === 'THIS_YEAR' && !isThisYear(reviewDate)) {
                return false;
            }
            if (filters.timeFilter === 'THIS_MONTH' && !isThisMonth(reviewDate)) {
                return false;
            }
            
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            
            if (filters.dateSort === 'NEWEST') {
                return dateB - dateA; // Newest first
            } else {
                return dateA - dateB; // Oldest first
            }
        });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage);
    const paginatedReviews = filteredAndSortedReviews.slice(
        (currentPage - 1) * reviewsPerPage,
        currentPage * reviewsPerPage
    );
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Fetch feedback data
    useEffect(() => {
        const loadFeedback = async () => {
            setLoading(true);
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 100 // Get all feedback for customer view
                });
                
                // Transform API data to match Review interface
                const transformedReviews: Review[] = response.data.map(feedback => ({
                    id: feedback.id,
                    customerName: feedback.customerName,
                    overallRating: feedback.overallRating,
                    title: feedback.title,
                    reviewText: feedback.reviewText,
                    createdAt: feedback.createdAt,
                    branchName: feedback.branchName,
                    productName: feedback.productName,
                    feedbackType: feedback.feedbackType,
                    feedbackStatus: feedback.feedbackStatus,
                    responseText: feedback.responseText,
                    responseDate: feedback.responseDate,
                    respondedBy: feedback.respondedBy,
                    respondedByName: feedback.respondedByName,
                    images: feedback.images || [],
                    categoryRatings: feedback.categoryRatings
                }));
                
                setReviews(transformedReviews);
            } catch (error) {
                console.error('Failed to load feedback:', error);
                setReviews([]); // Empty array on error
            } finally {
                setLoading(false);
            }
        };

        loadFeedback();
    }, []);

    const handleResponse = async (reviewId: number, responseText: string) => {
        try {
            // Use the real API to respond to feedback
            const updatedFeedback = await managerFeedbackAPI.respondToFeedback(reviewId, {
                responseText: responseText
            });
            
            // Update the review with the response
            setReviews(prevReviews => 
                prevReviews.map(review => 
                    review.id === reviewId 
                        ? {
                            ...review,
                            responseText: updatedFeedback.responseText,
                            responseDate: updatedFeedback.responseDate,
                            respondedBy: updatedFeedback.respondedBy,
                            respondedByName: updatedFeedback.respondedByName,
                            feedbackStatus: 'RESPONDED' as const
                        }
                        : review
                )
            );
            
            toast.success('Success', 'Response sent successfully!');
        } catch (error: any) {
            console.error('Failed to send response:', error);
            toast.error('Error', 'Failed to send response');
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        // Refetch feedback data after new submission
        const loadFeedback = async () => {
            try {
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 100
                });
                
                const transformedReviews: Review[] = response.data.map(feedback => ({
                    id: feedback.id,
                    customerName: feedback.customerName,
                    overallRating: feedback.overallRating,
                    title: feedback.title,
                    reviewText: feedback.reviewText,
                    createdAt: feedback.createdAt,
                    branchName: feedback.branchName,
                    productName: feedback.productName,
                    feedbackType: feedback.feedbackType,
                    feedbackStatus: feedback.feedbackStatus,
                    responseText: feedback.responseText,
                    responseDate: feedback.responseDate,
                    respondedBy: feedback.respondedBy,
                    respondedByName: feedback.respondedByName,
                    images: feedback.images || [],
                    categoryRatings: feedback.categoryRatings
                }));
                
                setReviews(transformedReviews);
            } catch (error) {
                console.error('Failed to reload feedback:', error);
            }
        };
        
        loadFeedback();
        toast.success('Success', 'Thank you for your feedback!');
    };

    // Transform branches data to the format expected by the forms
    const branches = branchesData?.map(branch => ({
        id: branch.id,
        name: branch.name
    })) || [];

    // Transform products data to the format expected by the forms
    const products = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized'
    })) || [];

    // Calculate average rating
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.overallRating, 0) /
              reviews.length
            : 0;

    const totalReviews = reviews.length;

    // Show loading state while data is being fetched
    if (loading || branchesLoading || productsLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if there are API errors
    if (branchesError || productsError) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Failed to load data
                        </h3>
                        <p className="text-gray-500 mb-4">
                            There was an error loading the required data. Please try again.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                            
                            {/* Star breakdown - Interactive like Play Store */}
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    Rating Distribution
                                    {filters.starRating !== 'ALL' && (
                                        <button 
                                            onClick={() => setFilters({...filters, starRating: 'ALL'})}
                                            className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Clear filter
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count = reviews.filter(r => r.overallRating === rating).length;
                                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                        const isSelected = filters.starRating === rating.toString();
                                        const isDisabled = count === 0;
                                        
                                        return (
                                            <button
                                                key={rating}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        setFilters({
                                                            ...filters, 
                                                            starRating: isSelected ? 'ALL' : rating.toString()
                                                        });
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={`flex items-center gap-2 text-sm w-full p-1 rounded transition-all duration-200 ${
                                                    isSelected 
                                                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                                                        : isDisabled 
                                                        ? 'opacity-50 cursor-not-allowed' 
                                                        : 'hover:bg-gray-50 cursor-pointer'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1 w-12">
                                                    <span className={isSelected ? 'font-medium text-blue-700' : ''}>{rating}</span>
                                                    <Star size={12} className={`${
                                                        isSelected 
                                                            ? 'fill-blue-400 text-blue-400' 
                                                            : 'fill-yellow-400 text-yellow-400'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            isSelected ? 'bg-blue-400' : 'bg-yellow-400'
                                                        }`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`w-8 text-right ${
                                                    isSelected ? 'font-medium text-blue-700' : 'text-gray-500'
                                                }`}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort & Time Filters */}
                    <div className="bg-white rounded-lg border p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter size={16} className="text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Sort & Filter Options</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Sort by Date</label>
                                <Select value={filters.dateSort} onValueChange={(value) => setFilters({...filters, dateSort: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEWEST">
                                            <div className="flex items-center gap-2">
                                                <SortDesc size={14} />
                                                Newest First
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="OLDEST">
                                            <div className="flex items-center gap-2">
                                                <SortAsc size={14} />
                                                Oldest First
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Time Period</label>
                                <Select value={filters.timeFilter} onValueChange={(value) => setFilters({...filters, timeFilter: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Time</SelectItem>
                                        <SelectItem value="THIS_YEAR">This Year</SelectItem>
                                        <SelectItem value="THIS_MONTH">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {/* Active filters display */}
                        {(filters.starRating !== 'ALL' || filters.timeFilter !== 'ALL' || filters.dateSort !== 'NEWEST') && (
                            <div className="mt-4 pt-3 border-t">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Showing:</span>
                                    {filters.starRating !== 'ALL' && (
                                        <Badge variant="outline">{filters.starRating} stars</Badge>
                                    )}
                                    {filters.timeFilter !== 'ALL' && (
                                        <Badge variant="outline">
                                            {filters.timeFilter === 'THIS_YEAR' ? 'This Year' : 'This Month'}
                                        </Badge>
                                    )}
                                    {filters.dateSort !== 'NEWEST' && (
                                        <Badge variant="outline">Oldest First</Badge>
                                    )}
                                    <span className="ml-auto">{filteredAndSortedReviews.length} of {totalReviews} reviews</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                <div>
                    {filteredAndSortedReviews.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No reviews yet
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {reviews.length === 0 
                                        ? 'Be the first to share your experience with us!' 
                                        : 'No reviews match your current filters. Try adjusting the filters above.'}
                                </p>
                                <Button onClick={() => setIsFormOpen(true)}>
                                    Write the First Review
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div>
                            {paginatedReviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onResponse={handleResponse}
                                />
                            ))}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-700">
                                        Showing {(currentPage - 1) * reviewsPerPage + 1} to {Math.min(currentPage * reviewsPerPage, filteredAndSortedReviews.length)} of {filteredAndSortedReviews.length} reviews
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={16} />
                                            Previous
                                        </Button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === currentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}