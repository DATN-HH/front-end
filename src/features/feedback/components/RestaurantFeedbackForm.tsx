'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    customerFeedbackAPI,
    RestaurantFeedbackCreateDto,
    FeedbackRatingDto,
} from '@/api/v1/feedback';
import { useCustomToast } from '@/lib/show-toast';
import { useUploadMultipleImages } from '@/api/v1/images';
import { useRouter } from 'next/navigation';

const ratingCategories = [
    { key: 'SERVICE', label: 'Service Quality' },
    { key: 'FOOD_QUALITY', label: 'Food Quality' },
    { key: 'AMBIANCE', label: 'Ambiance' },
    { key: 'CLEANLINESS', label: 'Cleanliness' },
    { key: 'VALUE', label: 'Value for Money' },
    { key: 'STAFF_FRIENDLINESS', label: 'Staff Friendliness' },
] as const;

const orderTypes = [
    { value: 'POS_ORDER', label: 'Dine-in' },
    { value: 'PRE_ORDER', label: 'Pre-order' },
    { value: 'BOOKING_TABLE', label: 'Table Booking' },
] as const;

const feedbackSchema = z.object({
    overallRating: z.number().min(1, 'Please provide an overall rating').max(5),
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    reviewText: z
        .string()
        .max(1000, 'Review must be less than 1000 characters')
        .optional(),
    customerName: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    customerEmail: z.string().email('Please enter a valid email address'),
    customerPhone: z.string().optional(),
    branchId: z.number().min(1, 'Please select a branch'),
    orderType: z.enum(['POS_ORDER', 'PRE_ORDER', 'BOOKING_TABLE']).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface RestaurantFeedbackFormProps {
    branches: Array<{ id: number; name: string }>;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function RestaurantFeedbackForm({
    branches,
    onSuccess,
    onCancel,
}: RestaurantFeedbackFormProps) {
    const toast = useCustomToast();
    const router = useRouter();
    const uploadImagesMutation = useUploadMultipleImages();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [categoryRatings, setCategoryRatings] = useState<
        Record<string, number>
    >({});
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    const form = useForm<FeedbackFormData>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            overallRating: 0,
            title: '',
            reviewText: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            branchId: 0,
        },
    });

    const handleRatingChange = (category: string, rating: number) => {
        setCategoryRatings((prev) => ({ ...prev, [category]: rating }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length + uploadedImages.length > 5) {
            toast.error('Error', 'Maximum 5 images allowed');
            return;
        }
        setUploadedImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FeedbackFormData) => {
        if (data.overallRating === 0) {
            toast.error('Error', 'Please provide an overall rating');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload images first if any
            let imageUrls: string[] = [];
            if (uploadedImages.length > 0) {
                try {
                    const uploadResults =
                        await uploadImagesMutation.mutateAsync({
                            files: uploadedImages,
                            folder: 'feedback',
                        });
                    imageUrls = uploadResults.map((result) => result.secureUrl);
                } catch (error) {
                    console.error('Failed to upload images:', error);
                    toast.error(
                        'Error',
                        'Failed to upload images. Please try again.'
                    );
                    setIsSubmitting(false);
                    return;
                }
            }

            const feedbackData: RestaurantFeedbackCreateDto = {
                ...data,
                categoryRatings,
                imageUrls: imageUrls,
            };

            await customerFeedbackAPI.submitRestaurantFeedback(feedbackData);

            // Show success state
            setIsSuccess(true);
            toast.success(
                'Success',
                'Your feedback has been submitted successfully!'
            );

            // Call onSuccess callback if provided
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to submit feedback:', error);
            toast.error(
                'Error',
                error.response?.data?.message || 'Failed to submit feedback'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({
        value,
        onChange,
        size = 24,
    }: {
        value: number;
        onChange: (rating: number) => void;
        size?: number;
    }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-colors hover:scale-110"
                    >
                        <Star
                            size={size}
                            className={
                                star <= value
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Restaurant Feedback
                </CardTitle>
                <CardDescription>
                    Share your dining experience with us. Your feedback helps us
                    improve our service.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSuccess ? (
                    // Success State
                    <div className="text-center py-8 space-y-6">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-green-700">
                                Thank You!
                            </h3>
                            <p className="text-gray-600">
                                Your restaurant feedback has been submitted
                                successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                We appreciate your time and will use your
                                feedback to improve our service.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={onCancel} variant="outline">
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsSuccess(false);
                                    form.reset();
                                    setCategoryRatings({});
                                    setUploadedImages([]);
                                }}
                                variant="default"
                            >
                                Submit Another Review
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Form State
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Overall Rating */}
                            <FormField
                                control={form.control}
                                name="overallRating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Overall Rating *</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <StarRating
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    size={32}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {field.value > 0
                                                        ? `${field.value} out of 5 stars`
                                                        : 'Click to rate'}
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category Ratings */}
                            <div className="space-y-4">
                                <FormLabel>Detailed Ratings</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ratingCategories.map((category) => (
                                        <div
                                            key={category.key}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <span className="text-sm font-medium">
                                                {category.label}
                                            </span>
                                            <StarRating
                                                value={
                                                    categoryRatings[
                                                        category.key
                                                    ] || 0
                                                }
                                                onChange={(rating) =>
                                                    handleRatingChange(
                                                        category.key,
                                                        rating
                                                    )
                                                }
                                                size={20}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Feedback Title *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Brief title for your feedback"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="branchId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Branch *</FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        parseInt(value)
                                                    )
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select branch" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {branches.map((branch) => (
                                                        <SelectItem
                                                            key={branch.id}
                                                            value={branch.id.toString()}
                                                        >
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reviewText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Your Review (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about your experience..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Share details about your dining
                                            experience
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Customer Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Email Address *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Phone Number (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your phone number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="orderType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Order Type (Optional)
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select order type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {orderTypes.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-4">
                                <FormLabel>Photos (Optional)</FormLabel>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4">
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer"
                                            >
                                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                                    Upload photos of your
                                                    experience
                                                </span>
                                                <span className="mt-1 block text-sm text-gray-500">
                                                    PNG, JPG up to 10MB each
                                                    (max 5 photos)
                                                </span>
                                            </label>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {uploadedImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedImages.map((file, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-2"
                                            >
                                                {file.name}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </Button>
                                {onCancel && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
